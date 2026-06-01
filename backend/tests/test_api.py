import pytest
from fastapi.testclient import TestClient
from PIL import Image
import io
import sys
import os

# Adjust import path to include backend directory
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.main import app
from app.api.endpoints import get_decoder
from app.services.interfaces import IBarcodeDecoder
from app.core.config import settings

client = TestClient(app)

class MockDecoder(IBarcodeDecoder):
    def __init__(self, should_succeed: bool = True, text: str = "DecodedText", format_detected: str = "QR_CODE"):
        self.should_succeed = should_succeed
        self.text = text
        self.format_detected = format_detected

    def decode(self, image: Image.Image, format_hint: str = None):
        if self.should_succeed:
            return True, self.text, self.format_detected
        return False, None, "No legible code found"

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_decode_success():
    # Mock decoder dependency
    mock_decoder = MockDecoder(should_succeed=True, text="https://example.com", format_detected="QRCode")
    app.dependency_overrides[get_decoder] = lambda: mock_decoder
    
    # Create simple 10x10 dummy image in memory
    img = Image.new("RGB", (10, 10), color="white")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)
    
    response = client.post(
        "/api/decode",
        files={"file": ("test.png", img_byte_arr, "image/png")},
        data={"format": "QR"}
    )
    
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert json_data["content"] == "https://example.com"
    assert json_data["format"] == "QRCode"
    
    app.dependency_overrides.clear()

def test_decode_failure():
    # Mock decoder failure path
    mock_decoder = MockDecoder(should_succeed=False)
    app.dependency_overrides[get_decoder] = lambda: mock_decoder
    
    img = Image.new("RGB", (10, 10), color="white")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)
    
    response = client.post(
        "/api/decode",
        files={"file": ("test.png", img_byte_arr, "image/png")},
        data={"format": "QR"}
    )
    
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is False
    assert "Could not decode" in json_data["message"]
    
    app.dependency_overrides.clear()

def test_invalid_file_type():
    # Post flat text instead of image
    response = client.post(
        "/api/decode",
        files={"file": ("test.txt", io.BytesIO(b"plain text content"), "text/plain")},
        data={"format": "QR"}
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is False
    assert "not a valid image" in json_data["message"]

def test_file_too_large():
    # Post payload > configured limit
    large_payload = io.BytesIO(b"0" * (settings.MAX_FILE_SIZE_BYTES + 1))
    response = client.post(
        "/api/decode",
        files={"file": ("large.png", large_payload, "image/png")},
        data={"format": "QR"}
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is False
    assert "File is too large" in json_data["message"]

def test_get_settings():
    response = client.get("/api/settings")
    assert response.status_code == 200
    json_data = response.json()
    assert "max_file_size_bytes" in json_data
    assert json_data["max_file_size_bytes"] == settings.MAX_FILE_SIZE_BYTES
