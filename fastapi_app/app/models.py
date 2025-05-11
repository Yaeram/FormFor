from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, JSON, DateTime
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

Base = declarative_base()

class Template(Base):
    __tablename__ = "templates"
    
    id = Column(String, primary_key=True)
    title = Column(String)
    type = Column(String)
    tag = Column(String)
    created_at = Column(DateTime)
    form_fields = Column(JSON)
    table_data = Column(JSON)
    rev = Column(String)

class TemplateCreate(BaseModel):
    class Config:
        allow_population_by_field_name = True


    id: str = Field(..., alias="_id")
    title: str
    type: str
    tag: str
    created_at: int = Field(..., alias="createdAt")
    form_fields: List[dict] = Field(default_factory=list, alias="formFields")
    table_data: List[dict] = Field(default_factory=list, alias="tableData")
    rev: Optional[str] = Field(None, alias="_rev")

class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True)
    template_id = Column(String)
    title = Column(String)
    type = Column(String)
    tag = Column(String)
    created_at = Column(DateTime)
    form_fields = Column(JSON)
    table_data = Column(JSON)
    rev = Column(String)

class FormCreate(BaseModel):
    class Config:
        allow_population_by_field_name = True

    id: str = Field(..., alias="_id")
    template_id: str = Field(..., alias="templateId")
    title: str
    type: str
    tag: str
    created_at: int = Field(..., alias="createdAt")
    form_fields: List[dict] = Field(default_factory=list, alias="formFields")
    table_data: List[dict] = Field(default_factory=list, alias="tableData")
    rev: Optional[str] = Field(None, alias="_rev")

class User(Base):
    __tablename__ = "users"

    username = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    username: str
    email: str
    password: str
