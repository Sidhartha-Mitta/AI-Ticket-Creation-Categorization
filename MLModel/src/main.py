from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid
import re
import traceback
import logging

from predict import predict_ticket_with_confidence

# ---------------- APP SETUP ----------------
app = FastAPI(title="AI Ticket Generator")

MIN_CHARS = 15
MAX_CHARS = 1000
CONFIDENCE_THRESHOLD = 0.40
SIMILARITY_THRESHOLD = 0.45

logger = logging.getLogger(__name__)

# ---------------- REQUEST MODEL ----------------
class TicketRequest(BaseModel):
    title:str
    description: str

# ---------------- API ROUTE ----------------
@app.post("/generate-ticket")
def generate_ticket(request: TicketRequest):

    try:
        description = request.description.strip()
        title = request.title

        # ❌ Empty
        if not description:
            raise HTTPException(
                status_code=400,
                detail="Description cannot be empty."
            )

        # ❌ Too short
        if len(description) < MIN_CHARS:
            raise HTTPException(
                status_code=400,
                detail="Too short description. Please explain your issue clearly."
            )

        # ❌ Too long
        if len(description) > MAX_CHARS:
            raise HTTPException(
                status_code=400,
                detail="Description too long. Please keep it under 1000 characters."
            )

        # 🔮 ML prediction
        try:
            result = predict_ticket_with_confidence(description)
        except Exception:
            logger.error(traceback.format_exc())
            raise HTTPException(
                status_code=500,
                detail="AI model failed to process the description."
            )

        # ❌ Low confidence
        if result["confidence"] < CONFIDENCE_THRESHOLD:
            raise HTTPException(
                status_code=400,
                detail="Description is unclear. Please provide more details."
            )

        # 🎫 Ticket
        ticket_id = f"TCKT-{uuid.uuid4().hex[:6].upper()}"
        return {
            "ticket_id": ticket_id,
            "title": title,
            "description": description,
            "category": result["category"],
            "priority": result["priority"],
            "confidence_level": round(result["confidence"], 2),
            "category_distribution": {
                k: round(v, 2)
                for k, v in result["category_distribution"].items()
            }
        }

    except HTTPException as e:
        raise e

    except Exception:
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Unexpected server error. Please try again later."
        )
