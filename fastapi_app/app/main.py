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
    tables = inspector.get_table_names()

    required_tables = set(Base.metadata.tables.keys())
    missing_tables = required_tables - set(tables)

    if missing_tables:
        print(f"🔧 Creating missing tables: {missing_tables}")
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created.")
    else:
        print("✅ All required tables already exist.")

app.include_router(template_routes.router)
app.include_router(form_routes.router)
app.include_router(auth_routes.router)

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI!"}
