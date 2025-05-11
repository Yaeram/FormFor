FROM python:3.9-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

RUN apt-get update && apt-get install -y iputils-ping curl dnsutils && \
    ping -c 4 google.com && \
    nslookup pypi.org && \
    curl -I https://pypi.org && \
    pip install --no-cache-dir -r requirements.txt

# Copy the entire app directory
COPY ./app ./app

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "-k", "uvicorn.workers.UvicornWorker", "--workers", "2", "app.main:app"]