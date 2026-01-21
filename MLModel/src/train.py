import os
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC

from .preprocessing import load_and_preprocess

# ---------- PATHS ----------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "balanced_finalDataset.csv")
DATA_PATH = os.path.join(BASE_DIR, "data", "raw", "finalDataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# ---------- LOAD CLEANED DATA ----------
df, category_encoder, priority_encoder = load_and_preprocess(
    DATA_PATH,
    save_cleaned=True
)

# ---------- FEATURES ----------
X = df["clean_text"]

# ---------- TF-IDF ----------
tfidf = TfidfVectorizer(
    max_features=15000,
    ngram_range=(1, 2),
    min_df=2,
    max_df=0.9
)

X_tfidf = tfidf.fit_transform(X)

pickle.dump(tfidf, open(os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"), "wb"))

# CATEGORY MODEL
y_category = df["category_label"]

X_train, X_test, y_train, y_test = train_test_split(
    X_tfidf, y_category, test_size=0.2, stratify=y_category, random_state=42
)

category_model = SVC(
    kernel='rbf',
    class_weight='balanced',
    random_state=42
)

category_model.fit(X_train, y_train)
y_pred = category_model.predict(X_test)

pickle.dump(category_model, open(os.path.join(MODEL_DIR, "category_model.pkl"), "wb"))
pickle.dump(category_encoder, open(os.path.join(MODEL_DIR, "category_encoder.pkl"), "wb"))

# PRIORITY MODEL
y_priority = df["priority_label"]

Xp_train, Xp_test, yp_train, yp_test = train_test_split(
    X_tfidf, y_priority, test_size=0.2, random_state=42, stratify=y_priority
)

priority_model = LogisticRegression(max_iter=1000, n_jobs=-1)
priority_model.fit(Xp_train, yp_train)

pickle.dump(priority_model, open(os.path.join(MODEL_DIR, "priority_model.pkl"), "wb"))
pickle.dump(priority_encoder, open(os.path.join(MODEL_DIR, "priority_encoder.pkl"), "wb"))

print("Training complete for category and priority models.")
