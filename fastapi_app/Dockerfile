FROM python:3.9-slim

# Установка зависимостей
WORKDIR /app
COPY requirements.txt .

RUN apt-get update && \
    apt-get install -y gcc libpq-dev && \
    pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Копируем исходники
COPY ./app ./app
# COPY ./init_db.py ./init_db.py

# Выполняем инициализацию БД при сборке (разово)
# RUN python init_db.py

# Порт и запуск
EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "-k", "uvicorn.workers.UvicornWorker", "--workers", "2", "app.main:app"]
