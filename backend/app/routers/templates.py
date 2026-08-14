from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/templates", tags=["templates"])


def _to_out(template: models.WorkoutTemplate) -> schemas.WorkoutTemplateOut:
    out = schemas.WorkoutTemplateOut.model_validate(template)
    for item_out, item_orm in zip(out.items, template.items):
        item_out.exercise_name = item_orm.exercise.name if item_orm.exercise else None
    return out


@router.get("", response_model=list[schemas.WorkoutTemplateOut])
def list_templates(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    templates = (
        db.query(models.WorkoutTemplate)
        .options(joinedload(models.WorkoutTemplate.items).joinedload(models.TemplateExercise.exercise))
        .filter(models.WorkoutTemplate.user_id == current_user.id)
        .order_by(models.WorkoutTemplate.created_at.desc())
        .all()
    )
    return [_to_out(t) for t in templates]


@router.get("/{template_id}", response_model=schemas.WorkoutTemplateOut)
def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    template = (
        db.query(models.WorkoutTemplate)
        .options(joinedload(models.WorkoutTemplate.items).joinedload(models.TemplateExercise.exercise))
        .filter(models.WorkoutTemplate.id == template_id, models.WorkoutTemplate.user_id == current_user.id)
        .first()
    )
    if not template:
        raise HTTPException(status_code=404, detail="Vorlage nicht gefunden")
    return _to_out(template)


@router.post("", response_model=schemas.WorkoutTemplateOut, status_code=201)
def create_template(
    payload: schemas.WorkoutTemplateCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    template = models.WorkoutTemplate(user_id=current_user.id, name=payload.name, notes=payload.notes)
    db.add(template)
    db.flush()

    for item in payload.items:
        exercise = db.query(models.Exercise).get(item.exercise_id)
        if not exercise:
            raise HTTPException(status_code=400, detail=f"Übung {item.exercise_id} nicht gefunden")
        db.add(models.TemplateExercise(
            template_id=template.id,
            exercise_id=item.exercise_id,
            order_index=item.order_index,
            target_sets=item.target_sets,
            target_reps=item.target_reps,
            notes=item.notes,
        ))

    db.commit()
    db.refresh(template)
    return _to_out(template)


@router.delete("/{template_id}", status_code=204)
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    template = (
        db.query(models.WorkoutTemplate)
        .filter(models.WorkoutTemplate.id == template_id, models.WorkoutTemplate.user_id == current_user.id)
        .first()
    )
    if not template:
        raise HTTPException(status_code=404, detail="Vorlage nicht gefunden")
    db.delete(template)
    db.commit()
