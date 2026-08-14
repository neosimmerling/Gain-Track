from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..services.milestones import evaluate_milestones_for_workout

router = APIRouter(prefix="/workouts", tags=["workouts"])


def _to_out(workout: models.Workout) -> schemas.WorkoutOut:
    out = schemas.WorkoutOut.model_validate(workout)
    for s, orm_set in zip(out.sets, workout.sets):
        s.exercise_name = orm_set.exercise.name if orm_set.exercise else None
    return out


@router.get("", response_model=list[schemas.WorkoutOut])
def list_workouts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    limit: int = 50,
):
    workouts = (
        db.query(models.Workout)
        .options(joinedload(models.Workout.sets).joinedload(models.SetEntry.exercise))
        .filter(models.Workout.user_id == current_user.id)
        .order_by(models.Workout.date.desc())
        .limit(limit)
        .all()
    )
    return [_to_out(w) for w in workouts]


@router.post("", response_model=schemas.WorkoutOut, status_code=201)
def create_workout(
    payload: schemas.WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    workout = models.Workout(
        user_id=current_user.id,
        date=payload.date or datetime.utcnow(),
        notes=payload.notes,
        duration_seconds=payload.duration_seconds,
        template_id=payload.template_id,
    )
    db.add(workout)
    db.flush()  # get workout.id

    for s in payload.sets:
        exercise = db.query(models.Exercise).get(s.exercise_id)
        if not exercise:
            raise HTTPException(status_code=400, detail=f"Übung {s.exercise_id} nicht gefunden")
        db.add(models.SetEntry(
            workout_id=workout.id,
            exercise_id=s.exercise_id,
            set_number=s.set_number,
            reps=s.reps,
            weight=s.weight,
            rpe=s.rpe,
        ))

    db.commit()
    db.refresh(workout)

    # Derive non-sensitive milestones (e.g. "3x diese Woche im Gym", "neuer PR") without exposing raw data
    evaluate_milestones_for_workout(db, current_user, workout)

    return _to_out(workout)


@router.delete("/{workout_id}", status_code=204)
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    workout = (
        db.query(models.Workout)
        .filter(models.Workout.id == workout_id, models.Workout.user_id == current_user.id)
        .first()
    )
    if not workout:
        raise HTTPException(status_code=404, detail="Workout nicht gefunden")
    db.delete(workout)
    db.commit()
