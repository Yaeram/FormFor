from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from typing import List

from ..models import Template, TemplateCreate, TemplateResponse
from ..database import get_db

router = APIRouter(prefix="/templates", tags=["Templates"])

@router.post("/")
async def create_template(template: TemplateCreate, db: Session = Depends(get_db)):
    try:
        db_template = Template(
            id=template.id,
            title=template.title,
            type=template.type,
            tag=template.tag,
            created_at=datetime.fromtimestamp(template.created_at / 1000),
            form_fields=template.form_fields,
            table_data=template.table_data,
            rev=template.rev or f"1-{uuid.uuid4().hex}",
            username=template.username
        )
        db.add(db_template)
        db.commit()
        db.refresh(db_template)

        return {
            "message": "Template created successfully",
            "_id": db_template.id,
            "_rev": db_template.rev
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/ids")
async def get_template_ids(db: Session = Depends(get_db)):
    templates = db.query(Template.id).all()
    return [t[0] for t in templates]

@router.get("/", response_model=List[TemplateResponse])
async def get_templates(db: Session = Depends(get_db)):
    templates = db.query(Template).all()
    return templates


@router.get("/by_user/{username}", response_model=List[dict])
async def get_templates_by_user(username: str, db: Session = Depends(get_db)):
    templates = db.query(Template).filter(Template.username == username).all()
    return [_to_response_model(t) for t in templates]


@router.get("/{template_id}")
async def get_template(template_id: str, db: Session = Depends(get_db)):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return _to_response_model(template)


@router.put("/{template_id}")
async def update_template(template_id: str, template: TemplateCreate, db: Session = Depends(get_db)):
    try:
        existing_template = db.query(Template).filter(Template.id == template_id).first()
        if not existing_template:
            raise HTTPException(status_code=404, detail="Template not found")

        existing_template.title = template.title
        existing_template.type = template.type
        existing_template.tag = template.tag
        existing_template.created_at = datetime.fromtimestamp(template.created_at / 1000)
        existing_template.form_fields = template.form_fields
        existing_template.table_data = template.table_data
        existing_template.rev = template.rev
        existing_template.username = template.username

        db.commit()
        db.refresh(existing_template)

        return {
            "message": "Template updated successfully",
            "_id": existing_template.id,
            "_rev": existing_template.rev
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{template_id}")
async def delete_template(template_id: str, db: Session = Depends(get_db)):
    try:
        template = db.query(Template).filter(Template.id == template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")

        db.delete(template)
        db.commit()
        return {"message": "Template deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


def _to_response_model(t: Template) -> dict:
    return {
        "title": t.title,
        "formFields": t.form_fields,
        "tableData": t.table_data,
        "type": t.type,
        "tag": t.tag,
        "createdAt": int(t.created_at.timestamp() * 1000),
        "_id": t.id,
        "_rev": t.rev
    }
