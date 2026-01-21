import re
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import os

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def load_and_preprocess(raw_csv_path, save_cleaned=True):
    df = pd.read_csv(raw_csv_path)

    # Drop ID column
    # df = df.drop(columns=["SNO"])

    # Clean text
    df["clean_text"] = df["text"].apply(clean_text)

    # Encode category
    category_encoder = LabelEncoder()
    df["category_label"] = category_encoder.fit_transform(df["category"])

    # Encode priority
    priority_encoder = LabelEncoder()
    df["priority_label"] = priority_encoder.fit_transform(df["priority"])

    # Save cleaned dataset
    if save_cleaned:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        clean_dir = os.path.join(base_dir, "data", "processed")
        os.makedirs(clean_dir, exist_ok=True)

        clean_path = os.path.join(clean_dir, "cleaned_dataset.csv")
        df.to_csv(clean_path, index=False)

        print(f"✅ Cleaned dataset saved at: {clean_path}")

    return df, category_encoder, priority_encoder


# import re
# import os
# import pandas as pd
# from sklearn.preprocessing import LabelEncoder
# from textblob import TextBlob

# def clean_text(text):
#     text = str(text).lower()
#     text = re.sub(r"http\S+", "", text)
#     text = re.sub(r"[^a-z\s]", "", text)
#     text = re.sub(r"\s+", " ", text).strip()
#     text = str(TextBlob(text).correct())
#     return text

# def load_and_preprocess(raw_csv_path, save_cleaned=True):
#     df = pd.read_csv(raw_csv_path)

#     df["clean_text"] = df["text"].apply(clean_text)

#     category_encoder = LabelEncoder()
#     df["category_label"] = category_encoder.fit_transform(df["category"])

#     priority_encoder = LabelEncoder()
#     df["priority_label"] = priority_encoder.fit_transform(df["priority"])

#     if save_cleaned:
#         base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
#         clean_dir = os.path.join(base_dir, "data", "processed")
#         os.makedirs(clean_dir, exist_ok=True)

#         clean_path = os.path.join(clean_dir, "cleaned_dataset.csv")
#         df.to_csv(clean_path, index=False)

#         print("Cleaned dataset saved at:", clean_path)

#     return df, category_encoder, priority_encoder
