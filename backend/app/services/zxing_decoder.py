import logging
from typing import Optional, Tuple, List
from PIL import Image
import numpy as np
import zxingcpp

from app.services.interfaces import IBarcodeDecoder

logger = logging.getLogger(__name__)

class ZXingDecoder(IBarcodeDecoder):
    def decode(self, image: Image.Image, format_hint: Optional[str] = None) -> Tuple[bool, Optional[str], Optional[str], Optional[str]]:
        """
        Decodes a barcode/QR code from a PIL image using zxing-cpp.
        """
        try:
            # Check if image is valid
            if image is None:
                return False, None, "Invalid image data", None

            # Convert PIL image to grayscale to improve performance and reliability
            # zxing-cpp works excellent with grayscale (Lum) representation
            gray_image = image.convert("L")
            img_np = np.array(gray_image)

            # Map the format hint to zxing-cpp formats
            formats = self._map_format_hint(format_hint)

            # Read barcodes
            if formats:
                results = zxingcpp.read_barcodes(img_np, formats=formats)
            else:
                results = zxingcpp.read_barcodes(img_np)

            if results:
                # Prioritize valid results
                valid_results = [r for r in results if r.valid]
                result = valid_results[0] if valid_results else results[0]
                
                # Check if result text is actually present
                if result.text:
                    format_name = str(result.format).split('.')[-1]
                    # Generate the recreated SVG directly from the decoded result object!
                    try:
                        # scale=3 is a good size, add_quiet_zones=True ensures scannability
                        recreated_svg = result.to_svg(scale=3, add_hrt=False, add_quiet_zones=True)
                    except Exception as svg_err:
                        logger.warning(f"Failed to generate SVG from result: {svg_err}")
                        recreated_svg = None
                    return True, result.text, format_name, recreated_svg

            return False, None, "No legible code found", None

        except Exception as e:
            logger.error(f"Error during barcode decoding: {str(e)}", exc_info=True)
            return False, None, f"Decoding error: {str(e)}", None

    def _map_format_hint(self, format_hint: Optional[str]) -> Optional[List[zxingcpp.BarcodeFormat]]:
        """
        Maps a format string to a list of zxingcpp.BarcodeFormat enums.
        """
        if not format_hint:
            return None

        hint = format_hint.strip().upper()

        if hint == "AUTO" or hint == "":
            return None

        # Custom mappings based on frontend select values
        if hint == "QR":
            return [
                zxingcpp.BarcodeFormat.QRCode,
                zxingcpp.BarcodeFormat.MicroQRCode,
                zxingcpp.BarcodeFormat.RMQRCode
            ]
        elif hint == "DATAMATRIX":
            return [zxingcpp.BarcodeFormat.DataMatrix]
        elif hint == "AZTEC":
            return [zxingcpp.BarcodeFormat.Aztec]
        elif hint == "EAN":
            # EAN/UPC barcodes
            return [
                zxingcpp.BarcodeFormat.EAN13,
                zxingcpp.BarcodeFormat.EAN8,
                zxingcpp.BarcodeFormat.UPCA,
                zxingcpp.BarcodeFormat.UPCE
            ]
        elif hint == "POSTCODE":
            # Postal tracking barcodes (ITF is Interleaved 2 of 5, widely used for package tracing)
            return [
                zxingcpp.BarcodeFormat.ITF,
                zxingcpp.BarcodeFormat.Codabar,
                zxingcpp.BarcodeFormat.Code128,
                zxingcpp.BarcodeFormat.Code39,
                zxingcpp.BarcodeFormat.PDF417
            ]

        # Fallback to try parsing format string directly if it matches exactly
        try:
            return [getattr(zxingcpp.BarcodeFormat, hint)]
        except AttributeError:
            logger.warning(f"Unknown format hint: {format_hint}, using default auto-detection.")
            return None
