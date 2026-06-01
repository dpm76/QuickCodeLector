from fastapi import APIRouter, File, UploadFile, Form, Depends
from PIL import Image
import io
import logging

from app.models.schemas import DecodeResponse
from app.services.interfaces import IBarcodeDecoder
from app.services.zxing_decoder import ZXingDecoder
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Dependency injection provider for decoder
def get_decoder() -> IBarcodeDecoder:
    return ZXingDecoder()

@router.get("/settings")
def get_settings():
    """
    Returns application configuration settings.
    """
    return {
        "max_file_size_bytes": settings.MAX_FILE_SIZE_BYTES
    } 

@router.post("/decode", response_model=DecodeResponse)
async def decode_code(
    file: UploadFile = File(...),
    format: str = Form("AUTO"),
    decoder: IBarcodeDecoder = Depends(get_decoder)
):
    """
    Endpoint to receive an image and a format hint, scan it for barcode/QR code,
    and return the decoded string contents.
    """
    # 1. Validate file format/type
    if not file.content_type or not file.content_type.startswith("image/"):
        return DecodeResponse(
            success=False,
            message="Uploaded file is not a valid image."
        )

    try:
        # 2. Read image file and enforce size limit
        contents = await file.read()
        if len(contents) > settings.MAX_FILE_SIZE_BYTES:
            limit_mb = settings.MAX_FILE_SIZE_BYTES / (1024 * 1024)
            limit_str = f"{limit_mb:.1f}".rstrip('0').rstrip('.') + "MB"
            return DecodeResponse(
                success=False,
                message=f"File is too large. Maximum size is {limit_str}."
            )

        # 3. Load image from memory
        try:
            image = Image.open(io.BytesIO(contents))
            # Verify the image is valid by loading it
            image.verify()
            # Reopen because verify() closes the file pointer / compromises image usage
            image = Image.open(io.BytesIO(contents))
        except Exception as img_err:
            logger.error(f"Image load failure: {img_err}")
            return DecodeResponse(
                success=False,
                message="Unable to parse file as an image."
            )

        # 4. Perform decoding
        success, decoded_text, format_detected = decoder.decode(image, format_hint=format)

        if success:
            return DecodeResponse(
                success=True,
                content=decoded_text,
                format=format_detected
            )
        else:
            return DecodeResponse(
                success=False,
                message=f"Could not decode any barcode or 2D code matching the '{format}' selection."
            )

    except Exception as e:
        logger.error(f"Unhandled error in decode_code endpoint: {str(e)}", exc_info=True)
        return DecodeResponse(
            success=False,
            message="An internal server error occurred during processing."
        )
