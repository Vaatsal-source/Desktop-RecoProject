import numpy as np
import pickle
import os
from sklearn.preprocessing import StandardScaler

# --- PATH FIX ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

X, y = [], []

if not os.path.exists(DATASET_DIR):
    os.makedirs(DATASET_DIR)

# FIX: Robust naming extraction. Get names from all _X files.
# This ensures "volume_up" isn't cut off to just "volume"
gesture_files = sorted(list(set([f.replace("_X.npy", "") 
                                for f in os.listdir(DATASET_DIR) if f.endswith("_X.npy")])))

if len(gesture_files) == 0:
    print("❌ ERROR: No data found in 'dataset' folder!")
    exit(1)

print(f"🔄 Preparing data for: {gesture_files}")

for index, name in enumerate(gesture_files):
    x_path = os.path.join(DATASET_DIR, f"{name}_X.npy")
    if os.path.exists(x_path):
        data_x = np.load(x_path)
        X.append(data_x)
        # index here is the target label (0, 1, 2...)
        y.append(np.full((len(data_x),), index))

X = np.vstack(X)
y = np.hstack(y)

scaler = StandardScaler()
X = scaler.fit_transform(X)

# --- SAVING ---
scaler_path = os.path.join(BASE_DIR, "scaler.pkl")
with open(scaler_path, "wb") as f:
    pickle.dump(scaler, f)

np.save(os.path.join(BASE_DIR, "X_train.npy"), X)
np.save(os.path.join(BASE_DIR, "y_train.npy"), y)

print(f"✅ Scaler and training data saved successfully.")