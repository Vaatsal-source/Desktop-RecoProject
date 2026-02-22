import cv2
import mediapipe as mp
import tensorflow as tf
import numpy as np
import pickle
import pyautogui
import time

with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)


interpreter = tf.lite.Interpreter(model_path="gesture_model.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()


mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)
cap = cv2.VideoCapture(0)


GESTURE_NAMES = ["FIST", "OPEN", "UP", "LEFT", "RIGHT"]

while True:
    ret, frame = cap.read()
    if not ret: break
    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    
    
    status_text = "Searching for hand..."
    color = (0, 0, 255) 

    if result.multi_hand_landmarks:
        hand = result.multi_hand_landmarks[0]
        wrist = hand.landmark[0]
        landmarks = []

        
        for lm in hand.landmark:
            landmarks.extend([lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z])
        
       
        X_scaled = scaler.transform(np.array(landmarks).reshape(1, -1)).astype(np.float32)
        
        
        interpreter.set_tensor(input_details[0]['index'], X_scaled)
        interpreter.invoke()
        pred = interpreter.get_tensor(output_details[0]['index'])

        confidence = np.max(pred)
        
        
        if confidence > 0.85: 
            gesture = GESTURE_NAMES[np.argmax(pred)]
            if gesture == "FIST":
                pyautogui.press('volumemute')
                time.sleep(3)
            elif gesture == "UP":
                pyautogui.press('volumeup')
                time.sleep(3)
            elif gesture == "OPEN":
        
                pyautogui.hotkey('win', 'r')
                pyautogui.write('chrome')
                pyautogui.press('enter')
                time.sleep(3)
            status_text = f"ACTIVE: {gesture} ({confidence*100:.0f}%)"
            color = (0, 255, 0) 
        else:
            status_text = "Uncertain Gesture..."
            color = (0, 255, 255) 

    
    cv2.rectangle(frame, (0, 0), (w, 60), (30, 30, 30), -1)
    cv2.putText(frame, status_text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

    cv2.imshow("Gesture Control - Stable Version", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'): break

cap.release()
cv2.destroyAllWindows()
