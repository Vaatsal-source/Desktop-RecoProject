# test_model.py
import numpy as np
import pickle
import tensorflow as tf

model = tf.keras.models.load_model("gesture_model.h5")

X_test = np.load("X_test.npy")
y_test = np.load("y_test.npy")

with open("labels.pkl", "rb") as f:
    labels = pickle.load(f)

pred = model.predict(X_test[:10])

for i in range(10):
    print(
        "Pred:", labels[np.argmax(pred[i])],
        "| True:", labels[y_test[i]],
        "| Confidence:", np.max(pred[i])
    )
