from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("", response_model=list[schemas.ExerciseOut])
def list_exercises(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # global exercises (owner_id is None) + the user's own custom ones
    return (
        db.query(models.Exercise)
        .filter(or_(models.Exercise.owner_id.is_(None), models.Exercise.owner_id == current_user.id))
        .order_by(models.Exercise.name)
        .all()
    )


@router.post("", response_model=schemas.ExerciseOut, status_code=201)
def create_exercise(
    payload: schemas.ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = (
        db.query(models.Exercise)
        .filter(models.Exercise.name == payload.name, models.Exercise.owner_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Übung existiert bereits")

    exercise = models.Exercise(
        name=payload.name, category=payload.category, unit=payload.unit, owner_id=current_user.id
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise
