FROM python:3.10-slim

WORKDIR /app

# Install system utilities (zxing-cpp installs wheels, but build-essential is helpful for general compilation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY app/ ./app/

EXPOSE 8000

# Default environment settings
ENV MAX_FILE_SIZE_BYTES=2097152

# Run uvicorn server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
