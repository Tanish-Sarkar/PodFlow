# Multi-stage build for Python 3.13 production runtime
FROM python:3.13-slim AS builder

WORKDIR /app

# Install system utilities needed for building wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Establish secure virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


FROM python:3.13-slim AS runner

WORKDIR /app

# Pull verified virtual environment from build stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Copy source modules
COPY src/ ./src/

# Create non-root system user for secure workspace confinement
RUN useradd -u 8888 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Run FastAPI production-ready ASGI server
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]