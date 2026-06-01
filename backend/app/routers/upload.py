import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.document import Document
from app.models.user import User
from app.routers.auth import get_current_active_user
from app.schemas.document import DocumentUploadResponse
from app.services.extractor import ALLOWED_TYPES, extract_text, get_file_extension

router = APIRouter(prefix="/upload", tags=["Upload"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user),
):
    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{content_type}'. Allowed: {', '.join(ALLOWED_TYPES.keys())}",
        )

    file_bytes = await file.read()
    if len(file_bytes) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum allowed size is {settings.MAX_FILE_SIZE // (1024 * 1024)} MB.",
        )

    try:
        extracted_text = await extract_text(file_bytes, content_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected extraction error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to extract text from the document. Please try again.",
        )

    safe_filename = file.filename or f"untitled{get_file_extension(content_type)}"
    doc = Document(
        filename=safe_filename,
        file_type=content_type,
        file_size=len(file_bytes),
        extracted_text=extracted_text,
        user_id=current_user.id if current_user else None,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return DocumentUploadResponse(
        document_id=doc.id,
        filename=doc.filename,
        extracted_text=extracted_text,
        message="Document uploaded and text extracted successfully.",
    )
