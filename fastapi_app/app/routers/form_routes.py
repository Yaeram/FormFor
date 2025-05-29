from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from typing import List

from ..models import Form, FormCreate, FormResponse
from ..database import get_db

router = APIRouter(prefix="/forms", tags=["Forms"])

@router.post("/")
async def create_form(form: FormCreate, db: Session = Depends(get_db)):
    try:
        db_form = Form(
            id=form.id,
            template_id=form.template_id,
            title=form.title,
            type=form.type,
            tag=form.tag,
            created_at=datetime.fromtimestamp(form.created_at / 1000),
            form_fields=form.form_fields,
            table_data=form.table_data,
            rev=form.rev or f"1-{uuid.uuid4().hex}",
            username=form.username  # Добавляем поле username
        )
        db.add(db_form)
        db.commit()
        db.refresh(db_form)

        return {
            "message": "Form created successfully",
            "_id": db_form.id,
            "_rev": db_form.rev
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/ids")
async def get_form_ids(db: Session = Depends(get_db)):
    forms = db.query(Form.id).all()
    return [f[0] for f in forms]

@router.get("/", response_model=List[FormResponse])
async def get_forms(db: Session = Depends(get_db)):
    forms = db.query(Form).all()
    return forms

@router.get("/by_user/{username}", response_model=List[dict])
async def get_forms_by_user(username: str, db: Session = Depends(get_db)):
    forms = db.query(Form).filter(Form.username == username).all()
    return [_to_response_model(f) for f in forms]

@router.get("/{form_id}")
async def get_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return _to_response_model(form)

@router.put("/{form_id}")
async def update_form(form_id: str, form: FormCreate, db: Session = Depends(get_db)):
    try:
        existing_form = db.query(Form).filter(Form.id == form_id).first()
        if not existing_form:
            raise HTTPException(status_code=404, detail="Form not found")

        existing_form.template_id = form.template_id
        existing_form.title = form.title
        existing_form.type = form.type
        existing_form.tag = form.tag
        existing_form.created_at = datetime.fromtimestamp(form.created_at / 1000)
        existing_form.form_fields = form.form_fields
        existing_form.table_data = form.table_data
        existing_form.rev = f"2-{uuid.uuid4().hex}"
        existing_form.username = form.username  # Обновляем username

        db.commit()
        db.refresh(existing_form)

        return {
            "message": "Form updated successfully",
            "_id": existing_form.id,
            "_rev": existing_form.rev
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{form_id}")
async def delete_form(form_id: str, db: Session = Depends(get_db)):
    try:
        form = db.query(Form).filter(Form.id == form_id).first()
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")

        db.delete(form)
        db.commit()
        return {"message": "Form deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def _to_response_model(f: Form) -> dict:
    return {
        "templateId": f.template_id,
        "title": f.title,
        "formFields": f.form_fields,
        "tableData": f.table_data,
        "type": f.type,
        "tag": f.tag,
        "createdAt": int(f.created_at.timestamp() * 1000),
        "_id": f.id,
        "_rev": f.rev,
        "username": f.username 
    }