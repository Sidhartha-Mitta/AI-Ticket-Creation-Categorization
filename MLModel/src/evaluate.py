import os
import pickle
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# ---------- PATH SETUP ----------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "cleaned_dataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")

# ---------- LOAD CLEANED DATA ----------
df = pd.read_csv(DATA_PATH)

X = df["clean_text"]
y_category = df["category_label"]
y_priority = df["priority_label"]

tfidf = pickle.load(open(os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"), "rb"))

category_model = pickle.load(open(os.path.join(MODEL_DIR, "category_model.pkl"), "rb"))
category_encoder = pickle.load(open(os.path.join(MODEL_DIR, "category_encoder.pkl"), "rb"))

priority_model = pickle.load(open(os.path.join(MODEL_DIR, "priority_model.pkl"), "rb"))
priority_encoder = pickle.load(open(os.path.join(MODEL_DIR, "priority_encoder.pkl"), "rb"))

X_tfidf = tfidf.transform(X)

# CATEGORY EVALUATION
print("\nCATEGORY EVALUATION\n")

y_cat_pred = category_model.predict(X_tfidf)

print("Accuracy:", accuracy_score(y_category, y_cat_pred))
print("\nClassification Report:\n")
print(
    classification_report(
        y_category,
        y_cat_pred,
        target_names=category_encoder.classes_
    )
)

print("Confusion Matrix:\n")
print(confusion_matrix(y_category, y_cat_pred))

# PRIORITY EVALUATION
print("\n PRIORITY EVALUATION \n")

y_prio_pred = priority_model.predict(X_tfidf)

print("Accuracy:", accuracy_score(y_priority, y_prio_pred))
print("\nClassification Report:\n")
print(
    classification_report(
        y_priority,
        y_prio_pred,
        target_names=priority_encoder.classes_
    )
)

print("Confusion Matrix:\n")
print(confusion_matrix(y_priority, y_prio_pred))
