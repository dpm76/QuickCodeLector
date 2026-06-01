from abc import ABC, abstractmethod
from typing import Optional, Tuple
from PIL import Image

class IBarcodeDecoder(ABC):
    @abstractmethod
    def decode(self, image: Image.Image, format_hint: Optional[str] = None) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Decodes a barcode or 2D code from a PIL Image.
        
        Args:
            image: The PIL Image object to scan.
            format_hint: An optional string representing the expected format (e.g., 'QR_CODE', 'AZTEC', 'DATA_MATRIX', 'EAN_13').
                         If 'AUTO', or None, the decoder should attempt auto-detection.
                         
        Returns:
            A tuple of (success: bool, content: Optional[str], format_name: Optional[str])
        """
        pass
