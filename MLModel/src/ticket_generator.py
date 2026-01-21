import os
import pickle
import re
import json
import uuid

# ---------- PATHS ----------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")

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

# ---------- GENERATE TICKET ----------
def generate_ticket(description):
    ticket_id = str(uuid.uuid4())
    cleaned_text = clean_text(description)
    predictions = predict_ticket(description)

    ticket = {
        "ticket_id": ticket_id,
        "description": description,
        "cleaned_text": cleaned_text,
        "category": predictions["category"],
        "priority": predictions["priority"]
    }

    return ticket

# ---------- CLI ----------
if __name__ == "__main__":
    description = input("Enter ticket description: ")
    ticket = generate_ticket(description)
    print(json.dumps(ticket, indent=4))