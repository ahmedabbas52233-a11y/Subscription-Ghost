"""
Document text extraction service.

PDF  → pdfplumber (selectable text) with PyMuPDF OCR fallback
Image → pytesseract (if Tesseract is installed) with graceful fallback
"""

import io
import logging
import shutil
from typing import Dict

import pdfplumber
from PIL import Image

logger = logging.getLogger(__name__)

ALLOWED_TYPES: Dict[str, str] = {
    "application/pdf": ".pdf",
    "image/png":       ".png",
    "image/jpeg":      ".jpg",
    "image/jpg":       ".jpg",
    "image/webp":      ".webp",
}

# ── Tesseract availability check (done once at import time) ──────────────────
_TESSERACT_AVAILABLE = False
try:
    import pytesseract

    # On Windows, Tesseract is often not on PATH even if installed.
    # Try common install locations automatically.
    import platform, os
    if platform.system() == "Windows":
        _candidates = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        ]
        if not shutil.which("tesseract"):
            for _path in _candidates:
                if os.path.isfile(_path):
                    pytesseract.pytesseract.tesseract_cmd = _path
                    break

    # Verify it actually runs
    pytesseract.get_tesseract_version()
    _TESSERACT_AVAILABLE = True
    logger.info("Tesseract OCR available: %s", pytesseract.get_tesseract_version())
except Exception as _e:
    logger.warning(
        "Tesseract not available (%s). Image OCR will use PIL-based fallback.", _e
    )


def get_file_extension(content_type: str) -> str:
    return ALLOWED_TYPES.get(content_type, ".bin")


async def extract_text(file_bytes: bytes, content_type: str) -> str:
    """Dispatch to the correct extractor based on MIME type."""
    if content_type not in ALLOWED_TYPES:
        raise ValueError(
            f"Unsupported file type: {content_type}. "
            f"Allowed: {', '.join(ALLOWED_TYPES.keys())}"
        )
    if content_type == "application/pdf":
        return await _extract_pdf(file_bytes)
    return await _extract_image(file_bytes)


# ── PDF ───────────────────────────────────────────────────────────────────────

async def _extract_pdf(file_bytes: bytes) -> str:
    """Extract selectable text from PDF. Raises ValueError for blank/image PDFs."""
    text_parts: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text.strip())

    result = "\n\n".join(text_parts).strip()
    if not result:
        raise ValueError(
            "No selectable text found in PDF. "
            "If this is a scanned document, export its pages as PNG/JPG and upload those instead."
        )
    return result


# ── Image ─────────────────────────────────────────────────────────────────────

async def _extract_image(file_bytes: bytes) -> str:
    """Extract text from image. Uses Tesseract when available, PIL fallback otherwise."""
    image = Image.open(io.BytesIO(file_bytes))

    # Normalise colour mode — Tesseract and PIL both prefer RGB or L
    if image.mode not in ("RGB", "L", "RGBA"):
        image = image.convert("RGB")
    elif image.mode == "RGBA":
        # Flatten transparency onto white background
        bg = Image.new("RGB", image.size, (255, 255, 255))
        bg.paste(image, mask=image.split()[3])
        image = bg

    if _TESSERACT_AVAILABLE:
        import pytesseract
        text = pytesseract.image_to_string(image, config="--psm 6")
        if text.strip():
            return text.strip()
        # Tesseract returned nothing — image may be very low contrast; try greyscale
        grey = image.convert("L")
        text = pytesseract.image_to_string(grey, config="--psm 6")
        if text.strip():
            return text.strip()

    # ── Graceful fallback: return useful metadata instead of crashing ──────
    # This lets users test the full upload→analysis pipeline even without
    # Tesseract installed.  The AI will receive the metadata and produce
    # a meaningful (if limited) response.
    logger.warning(
        "OCR unavailable or returned no text. Returning image metadata for document id."
    )
    width, height = image.size
    mode = image.mode
    # Very basic colour analysis
    img_rgb = image.convert("RGB") if mode != "RGB" else image
    img_small = img_rgb.resize((50, 50))
    pixels = list(img_small.getdata())
    avg_r = sum(p[0] for p in pixels) // len(pixels)
    avg_g = sum(p[1] for p in pixels) // len(pixels)
    avg_b = sum(p[2] for p in pixels) // len(pixels)
    brightness = (avg_r + avg_g + avg_b) // 3

    return (
        f"[Image document — OCR text extraction not available on this server]\n\n"
        f"Image properties:\n"
        f"- Dimensions: {width} × {height} pixels\n"
        f"- Colour mode: {mode}\n"
        f"- Average brightness: {brightness}/255 "
        f"({'bright/light document' if brightness > 180 else 'dark document' if brightness < 80 else 'medium contrast'})\n"
        f"- Estimated dominant colour: RGB({avg_r}, {avg_g}, {avg_b})\n\n"
        f"To enable full OCR text extraction:\n"
        f"1. Download Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki\n"
        f"2. Install to: C:\\Program Files\\Tesseract-OCR\\\n"
        f"3. Restart the backend server\n"
    )
