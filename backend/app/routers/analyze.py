import json
import logging
from typing import Optional, AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.models.document import Document
from app.models.user import User
from app.routers.auth import get_current_active_user

router = APIRouter(prefix="/analyze", tags=["Analyze"])
logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """You are DocuMind, an expert document analyst.
Analyze the provided document text and respond with a valid JSON object using this exact schema:
{
  "analysis": "<3-5 paragraph narrative summary>",
  "sentiment": "<positive|neutral|negative>",
  "key_points": ["<concise point>", "<concise point>", "<concise point>"],
  "recommendations": ["<action>", "<action>", "<action>"]
}
Be concise, professional, and actionable. Return ONLY valid JSON, no markdown fences, no extra text."""


def _sse(event: str, data: str) -> str:
    return f"event: {event}\ndata: {data}\n\n"


def _mock_analysis(text_snippet: str) -> dict:
    has_text = len(text_snippet.strip()) > 20
    return {
        "analysis": (
            "This document has been successfully uploaded and processed by DocuMind AI. "
            + ("The document contains readable text content that has been extracted. " if has_text else "The document metadata has been captured. ")
            + "To receive real AI-powered analysis, add your OpenAI API key to the backend "
            + ".env file (OPENAI_API_KEY=sk-proj-...) and restart the server."
        ),
        "sentiment": "neutral",
        "key_points": [
            "Document successfully uploaded and text extracted",
            "File stored securely in database",
            "Configure OPENAI_API_KEY in .env for live AI analysis",
        ],
        "recommendations": [
            "Add OPENAI_API_KEY to backend/.env file",
            "Restart uvicorn after updating .env",
            "Re-upload document to receive GPT-4o analysis",
        ],
    }


async def _stream_openai(text: str) -> AsyncGenerator[str, None]:
    """
    Yield SSE events.  Protocol:
      event: start  → analysis is beginning
      event: result → JSON payload (always sent, even on error — contains mock)
      event: done   → stream complete (ALWAYS the last event, no exceptions)
    """
    yield _sse("start", "")

    payload: dict | None = None

    if not settings.OPENAI_API_KEY:
        payload = _mock_analysis(text)
    else:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user",   "content": f"Document text:\n\n{text[:12_000]}"},
                ],
                max_tokens=1024,
                temperature=0.3,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content or ""
            payload = json.loads(content)
        except json.JSONDecodeError as exc:
            logger.error("GPT returned invalid JSON: %s", exc)
            payload = _mock_analysis(text)
        except Exception as exc:
            logger.exception("OpenAI error: %s", exc)
            # Fall back to mock so the UI always gets a result
            payload = _mock_analysis(text)

    # Guarantee: always yield result + done
    yield _sse("result", json.dumps(payload))
    yield _sse("done", "")


@router.post("/stream/{document_id}")
async def analyze_stream(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user),
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if doc.user_id is not None and (not current_user or doc.user_id != current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return StreamingResponse(
        _stream_openai(doc.extracted_text),
        media_type="text/event-stream",
        headers={
            "Cache-Control":     "no-cache",
            "X-Accel-Buffering": "no",
            "Connection":        "keep-alive",
        },
    )
