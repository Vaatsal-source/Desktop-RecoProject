import tensorflow as tf
from keras import layers, models
import numpy as np
import os

# --- PATH FIX ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

X_train = np.load(os.path.join(BASE_DIR, "X_train.npy"))
y_train = np.load(os.path.join(BASE_DIR, "y_train.npy"))

NUM_CLASSES = len(np.unique(y_train))
print(f"Training model to recognize {NUM_CLASSES} classes...")

model = models.Sequential([
    layers.Input(shape=(63,)),
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.2),
    layers.Dense(32, activation='relu'),
    layers.Dense(NUM_CLASSES, activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(X_train, y_train, epochs=50, batch_size=32, verbose=1)

# --- TFLITE CONVERSION & SAVING FIX ---
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

model_path = os.path.join(BASE_DIR, "gesture_model.tflite")
with open(model_path, "wb") as f:
    f.write(tflite_model)

# At the end of train_model.py
if os.path.exists(model_path):
    print(f"FILE_VERIFIED: {model_path} exists. Size: {os.path.getsize(model_path)} bytes")

print(f"✅ TFLite model saved successfully at: {model_path}")