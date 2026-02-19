import cv2
import mediapipe as mp
import numpy as np
import os
import time


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAVE_DIR = os.path.join(BASE_DIR, "dataset")
os.makedirs(SAVE_DIR, exist_ok=True)


mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.7)
cap = cv2.VideoCapture(0)

current_gesture = input(f"Enter gesture name ").lower()
print("Get ready... recording starts in 3 seconds.")
time.sleep(3)

data = []

while len(data) < 500: 
    ret, frame = cap.read()
    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    if result.multi_hand_landmarks:
        hand = result.multi_hand_landmarks[0]
        wrist = hand.landmark[0]
        landmarks = []
        for lm in hand.landmark:
            landmarks.extend([lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z])

        data.append(landmarks)
        cv2.putText(frame, f"Collected: {len(data)}/500", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow("Data Collection", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break


np.save(os.path.join(SAVE_DIR, f"{current_gesture}_X.npy"), np.array(data))
print(f"✅ Saved 500 samples for {current_gesture} in {SAVE_DIR}")

cap.release()
cv2.destroyAllWindows()