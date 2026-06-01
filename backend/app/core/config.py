import os

class Settings:
    PROJECT_NAME: str = "QuickCodeLector"
    # Default is 2MB (2 * 1024 * 1024)
    MAX_FILE_SIZE_BYTES: int = int(os.getenv("MAX_FILE_SIZE_BYTES", str(2 * 1024 * 1024)))

settings = Settings()
