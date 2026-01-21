# AI Ticket Generator

An AI-powered ticket classification system that automatically categorizes and prioritizes support tickets using machine learning models.

## Features

- **Category Classification**: Automatically classifies tickets into predefined categories (e.g., Hardware, Software, Network)
- **Priority Assessment**: Determines ticket priority levels (Low, Medium, High, Urgent)
- **Confidence Scoring**: Provides confidence levels for predictions
- **FastAPI Web Service**: RESTful API for easy integration

## Project Structure

```
├── data/
│   ├── raw/           # Raw dataset files
│   └── processed/     # Cleaned and processed data
├── models/            # Trained ML models and encoders
├── src/
│   ├── main.py        # FastAPI application
│   ├── predict.py     # Prediction logic
│   ├── train.py       # Model training script
│   ├── preprocessing.py # Data preprocessing utilities
│   └── evaluate.py    # Model evaluation (if needed)
├── requirements.txt   # Python dependencies
├── Procfile          # Deployment configuration for Render
├── runtime.txt       # Python version specification
└── README.md         # This file
```

## Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd AI_TICKET_PROJECT/MLModel
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Train the models** (if not already trained):
   ```bash
   python src/train.py
   ```

## Running Locally

Start the FastAPI server:
```bash
uvicorn src.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

### API Documentation

Once running, visit `http://127.0.0.1:8000/docs` for interactive Swagger UI documentation.

## API Usage

### Generate Ticket Classification

**Endpoint**: `POST /generate-ticket`

**Request Body**:
```json
{
  "title": "Printer not working",
  "description": "The office printer on floor 3 is not responding to print commands. Error message shows 'connection timeout'."
}
```

**Response**:
```json
{
  "ticket_id": "TCKT-A1B2C3",
  "title": "Printer not working",
  "description": "The office printer on floor 3 is not responding to print commands. Error message shows 'connection timeout'.",
  "category": "Hardware",
  "priority": "High",
  "confidence_level": 0.87,
  "category_distribution": {
    "Hardware": 0.87,
    "Software": 0.08,
    "Network": 0.05
  }
}
```

### Validation Rules

- Description must be between 15-1000 characters
- Minimum confidence threshold: 40%
- Clear, descriptive text improves accuracy

## Deployment on Render

1. **Push your code to GitHub/GitLab**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create a new Web Service on Render**:
   - Connect your repository
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - Or use the provided `Procfile`

3. **Environment Variables** (if needed):
   - No environment variables required for basic functionality

4. **Deploy**:
   - Render will automatically build and deploy your application
   - Your API will be available at the provided Render URL

## Model Training

To retrain models with new data:

1. Place your dataset in `data/raw/` as CSV with columns: `text`, `category`, `priority`
2. Update the `DATA_PATH` in `src/train.py` if needed
3. Run `python src/train.py`

## Technologies Used

- **FastAPI**: Modern web framework for building APIs
- **scikit-learn**: Machine learning library
- **pandas**: Data manipulation
- **numpy**: Numerical computing
- **TF-IDF Vectorization**: Text feature extraction
- **SVM & Logistic Regression**: Classification models

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]