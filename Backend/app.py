import os
import subprocess
import numpy as np
import pickle
import tensorflow as tf
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import pyautogui
import sys
import time
import threading

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", max_http_buffer_size=1e8)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
os.makedirs(DATASET_DIR, exist_ok=True)

scaler = None
interpreter = None
GESTURE_NAMES = []

def load_model_assets():
    """Forces the app to reload the math (scaler) and brains (model) from disk."""
    global scaler, interpreter, GESTURE_NAMES
    try:
        scaler_path = os.path.join(BASE_DIR, "scaler.pkl")
        model_path = os.path.join(BASE_DIR, "gesture_model.tflite")

        if os.path.exists(scaler_path):
            with open(scaler_path, "rb") as f:
                scaler = pickle.load(f)
            print(f"✅ Scaler Loaded")

        if os.path.exists(model_path):
            interpreter = tf.lite.Interpreter(model_path=model_path)
            interpreter.allocate_tensors()
            print(f"🎯 Model Loaded")

        
        if os.path.exists(DATASET_DIR):
            files = sorted(list(set([f.replace("_X.npy", "").replace("_y.npy", "") 
                                    for f in os.listdir(DATASET_DIR) if f.endswith("_X.npy")])))
            GESTURE_NAMES = [f.upper() for f in files]
            print(f"📋 Gestures Synced: {GESTURE_NAMES}")
        
    except Exception as e:
        print(f"❌ Detailed Load Error: {e}")

load_model_assets()

def run_training_sequence():
    """Background task to run scripts without blocking the server."""
    try:
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        
       
        prepare_script = os.path.join(backend_dir, "prepare_data.py")
        train_script = os.path.join(backend_dir, "train_model.py")

        socketio.emit('training_status', {'message': 'Preparing Data...'})
        subprocess.run([sys.executable, prepare_script], check=True, cwd=backend_dir)
        
        socketio.emit('training_status', {'message': 'Training Model...'})
        subprocess.run([sys.executable, train_script], check=True, cwd=backend_dir)
        
        load_model_assets()
        socketio.emit('training_complete', {'status': 'success'})
        
    except Exception as e:
        print(f"Training Task Error: {e}")
        socketio.emit('training_complete', {'status': 'error', 'error': str(e)})

@socketio.on('predict')
def handle_prediction(data):
    global scaler, interpreter, GESTURE_NAMES
    if not scaler or not interpreter or not GESTURE_NAMES: return
    
    try:
        
        landmarks = data.get('landmarks')
        mappings = data.get('mappings', {})

        if not landmarks: return

        input_data = np.array(landmarks).reshape(1, -1)
        X_scaled = scaler.transform(input_data).astype(np.float32)

        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        interpreter.set_tensor(input_details[0]['index'], X_scaled)
        interpreter.invoke()
        pred = interpreter.get_tensor(output_details[0]['index'])[0]

        confidence = float(np.max(pred))
        gesture_index = int(np.argmax(pred))
        
        gesture = GESTURE_NAMES[gesture_index] if gesture_index < len(GESTURE_NAMES) else "NONE"

        
        if confidence > 0.70 and gesture != "NONE":
            action = mappings.get(gesture)
            if action:
                execute_system_action(action)
            if action == "none":       
                emit('prediction_result', {'gesture': "none", 'confidence': confidence})
                return

        emit('prediction_result', {'gesture': gesture if confidence > 0.7 else "CALIBRATING...", 'confidence': confidence})
    except Exception as e:
        print(f"Prediction Error: {e}")

def execute_system_action(action):
    def run():
        import time
        time.sleep(3)
        try:
            if action == "volumeup": pyautogui.press('volumeup')
            elif action == "volumedown": pyautogui.press('volumedown')
            elif action == "volumemute": 
                pyautogui.press('volumemute')
            
            elif action == "nexttrack": 
                pyautogui.press('nexttrack')
        
            elif action == "prevtrack": 
                pyautogui.press('prevtrack')
                
            elif action == "playpause": 
                pyautogui.press('playpause')
                
            elif action == "enter": 
                pyautogui.press('enter')
                
            elif action == "chrome":
                if sys.platform == "win32":
                    os.startfile("chrome.exe")
            else:
                subprocess.Popen(["google-chrome"])
        except Exception as e:
            print(f"Action Error: {e}")
    threading.Thread(target=run, daemon=True).start()

@socketio.on('collect_data')
def handle_collection(data):
    gesture_name = data['gesture'].lower().replace(" ", "_")
    landmarks = data['landmarks']
    x_path = os.path.join(DATASET_DIR, f"{gesture_name}_X.npy")
    y_path = os.path.join(DATASET_DIR, f"{gesture_name}_y.npy")
    
    if os.path.exists(x_path):
        existing_x = np.load(x_path)
        if len(existing_x) >= 500:
            emit('collection_success', {'count': 500, 'done': True})
            return
        new_x = np.vstack([existing_x, np.array(landmarks).reshape(1, -1)])
    else:
        new_x = np.array(landmarks).reshape(1, -1)
        
    np.save(x_path, new_x)
    np.save(y_path, np.zeros(len(new_x)))
    
    if len(new_x) % 10 == 0 or len(new_x) >= 500:
        emit('collection_success', {'count': len(new_x), 'done': len(new_x) >= 500})

@socketio.on('train_model')
def handle_train():
    thread = threading.Thread(target=run_training_sequence)
    thread.start()
    emit('training_status', {'message': 'Training initialized...'})

@socketio.on('delete_gesture_data') 
def handle_delete_data(data):
    gesture_name = data['gesture'].lower().replace(" ", "_")
    x_path = os.path.join(DATASET_DIR, f"{gesture_name}_X.npy")
    y_path = os.path.join(DATASET_DIR, f"{gesture_name}_y.npy")
    try:
        if os.path.exists(x_path): os.remove(x_path)
        if os.path.exists(y_path): os.remove(y_path)
        load_model_assets()
        emit('training_status', {'message': f'Deleted {gesture_name}. Please Retrain.'})
    except Exception as e: print(f"Delete Error: {e}")

@socketio.on('connect')
def handle_connect():
    files = []
    if os.path.exists(DATASET_DIR):
        files = sorted(list(set([f.replace("_X.npy", "").replace("_y.npy", "") 
                                for f in os.listdir(DATASET_DIR) if f.endswith("_X.npy")])))
    
    emit('system_info', {
        'gestures': [f.upper() for f in files],
        'model_ready': interpreter is not None
    })

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
