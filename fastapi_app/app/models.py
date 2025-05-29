from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, ForeignKey, JSON, DateTime
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

Base = declarative_base()

class Template(Base):
    __tablename__ = "templates"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    tag = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)
    form_fields = Column(JSON, nullable=False)
    table_data = Column(JSON, nullable=False)
    rev = Column(String, nullable=False)
    username = Column(String, ForeignKey("users.username"), nullable=False)


class TemplateCreate(BaseModel):
    id: str = Field(validation_alias="_id")
    title: str
    type: str
    tag: str
    created_at: int = Field(validation_alias="createdAt")
    form_fields: List[dict] = Field(default_factory=list, validation_alias="formFields")
    table_data: List[dict] = Field(default_factory=list, validation_alias="tableData")
    rev: Optional[str] = Field(default=None, validation_alias="_rev")
    username: str

    model_config = {
        "populate_by_name": True
    }

class TemplateResponse(BaseModel):
    id: str
    title: str
    type: str
    tag: str
    created_at: datetime
    form_fields: List[dict]
    table_data: List[dict]
    rev: str
    username: str

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat()
        }
    }

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
    username = Column(String, ForeignKey("users.username"), nullable=False)


class FormCreate(BaseModel):
    id: str = Field(validation_alias="_id")
    template_id: str = Field(validation_alias="templateId")
    title: str
    type: str
    tag: str
    created_at: int = Field(validation_alias="createdAt")
    form_fields: List[dict] = Field(default_factory=list, validation_alias="formFields")
    table_data: List[dict] = Field(default_factory=list, validation_alias="tableData")
    rev: Optional[str] = Field(default=None, validation_alias="_rev")
    username: str

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }

class FormResponse(BaseModel):
    id: str
    template_id: str
    title: str
    type: str
    tag: str
    created_at: datetime
    form_fields: List[dict]
    table_data: List[dict]
    rev: str
    username: str

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat()
        }
    }

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
    hashed_password: str

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }
