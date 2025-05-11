import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..models import Form, FormCreate
from ..database import get_db

router = APIRouter()

@router.post("/forms/")
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
            rev=form.rev or f"1-{uuid.uuid4().hex}"
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
 
    
@router.get("/forms/")
async def get_all_forms(db: Session = Depends(get_db)):
    try:
        forms = db.query(Form).all()
        result = []
        for form in forms:
            result.append({
                "_id": form.id,
                "templateId": form.template_id,
                "title": form.title,
                "type": form.type,
                "tag": form.tag,
                "createdAt": int(form.created_at.timestamp() * 1000),
                "formFields": form.form_fields,
                "tableData": form.table_data,
                "_rev": form.rev
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/forms/{form_id}")
async def update_form(
    form_id: str,
    updated_form: FormCreate,
    db: Session = Depends(get_db)
):
    try:
        db_form = db.query(Form).filter(Form.id == form_id).first()
        if not db_form:
            raise HTTPException(status_code=404, detail="Form not found")

        db_form.template_id = updated_form.template_id
        db_form.title = updated_form.title
        db_form.type = updated_form.type
        db_form.tag = updated_form.tag
        db_form.created_at = datetime.fromtimestamp(updated_form.created_at / 1000)
        db_form.form_fields = updated_form.form_fields
        db_form.table_data = updated_form.table_data
        db_form.rev = updated_form.rev or f"1-{uuid.uuid4().hex}"

        db.commit()
        db.refresh(db_form)

        return {
            "message": "Form updated successfully",
            "_id": db_form.id,
            "_rev": db_form.rev
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/forms/{form_id}")
async def delete_form(form_id: str, db: Session = Depends(get_db)):
    try:
        db_form = db.query(Form).filter(Form.id == form_id).first()
        if not db_form:
            raise HTTPException(status_code=404, detail="Form not found")

        db.delete(db_form)
        db.commit()

        return {"message": f"Form with id {form_id} deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))