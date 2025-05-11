from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect

from .models import Base
from .database import engine
from .routers import template_routes, form_routes, auth_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.on_event("startup")
async def startup():
    inspector = inspect(engine)

    tables_to_check = ["templates", "forms", "users"]
    existing_tables = inspector.get_table_names()

    tables_missing = [table for table in tables_to_check if table not in existing_tables]

    if tables_missing:
        Base.metadata.create_all(bind=engine)
        print(f"Созданы таблицы: {', '.join(tables_missing)}")
    else:
        print("Все нужные таблицы уже существуют")

# Подключение маршрутов
app.include_router(template_routes.router)
app.include_router(form_routes.router)
app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI!"}
