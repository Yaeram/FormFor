from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models import User, UserCreate, UserLogin, UserOut
from ..database import get_db
from ..utils import hash_password, verify_password
from typing import List

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")

    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    
    return {"message": "Успешный вход", "username": db_user.username}

@router.get("/users", response_model=List[UserOut])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users