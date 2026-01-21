import os
import pickle
import re
import numpy as np

# ---------- PATHS ----------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")


def softmax(x):
    exp_x = np.exp(x - np.max(x))
    return exp_x / exp_x.sum()


def predict_ticket_with_confidence(text):
    text = clean_text(text)
    vector = tfidf.transform([text])

    # Category
    decision_scores = category_model.decision_function(vector)[0]
    probs = softmax(decision_scores)

    predicted_index = np.argmax(probs)
    confidence = float(probs[predicted_index])

    category = category_encoder.inverse_transform([predicted_index])[0]

    category_distribution = {
        category_encoder.inverse_transform([i])[0]: float(probs[i])
        for i in range(len(probs))
    }

    # Priority (LogisticRegression already supports probabilities)
    prio_index = priority_model.predict(vector)[0]
    priority = priority_encoder.inverse_transform([prio_index])[0]

    return {
        "category": category,
        "priority": priority,
        "confidence": confidence,
        "category_distribution": category_distribution
    }


# ---------- CLEAN ----------
def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

# ---------- LOAD MODELS ----------
tfidf = pickle.load(open(os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"), "rb"))

category_model = pickle.load(open(os.path.join(MODEL_DIR, "category_model.pkl"), "rb"))
category_encoder = pickle.load(open(os.path.join(MODEL_DIR, "category_encoder.pkl"), "rb"))

priority_model = pickle.load(open(os.path.join(MODEL_DIR, "priority_model.pkl"), "rb"))
priority_encoder = pickle.load(open(os.path.join(MODEL_DIR, "priority_encoder.pkl"), "rb"))

# ---------- PREDICT ----------
def predict_ticket(text):
    text = clean_text(text)
    vector = tfidf.transform([text])

    cat_pred = category_model.predict(vector)[0]
    prio_pred = priority_model.predict(vector)[0]

    return {
        "category": category_encoder.inverse_transform([cat_pred])[0],
        "priority": priority_encoder.inverse_transform([prio_pred])[0]
    }

# ---------- CLI ----------
if __name__ == "__main__":
    ticket = input("Enter ticket text: ")
    result = predict_ticket(ticket)
    print("Predicted Category:", result["category"])
    print("Predicted Priority:", result["priority"])
