from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/exercise/{exercise_id}/progress", response_model=list[schemas.ExerciseProgressPoint])
def exercise_progress(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    sets = (
        db.query(models.SetEntry)
        .join(models.Workout)
        .filter(
            models.Workout.user_id == current_user.id,
            models.SetEntry.exercise_id == exercise_id,
        )
        .options(joinedload(models.SetEntry.workout))
        .all()
    )

    by_date = defaultdict(list)
    for s in sets:
        by_date[s.workout.date.date()].append(s)

    points = []
    for day, day_sets in sorted(by_date.items()):
        weight_sets = [s for s in day_sets if s.weight is not None]
        max_weight = max((s.weight for s in weight_sets), default=None)
        total_volume = sum((s.weight or 0) * (s.reps or 0) for s in day_sets)
        total_duration = sum((s.duration_seconds or 0) for s in day_sets)
        points.append(schemas.ExerciseProgressPoint(
            date=day, max_weight=max_weight, total_volume=total_volume, total_duration_seconds=total_duration
        ))
    return points


@router.get("/summary")
def summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    total_workouts = (
        db.query(models.Workout).filter(models.Workout.user_id == current_user.id).count()
    )
    return {"total_workouts": total_workouts}
