"""
Leitet aus den privaten Trainingsdaten generische, unkritische "Erfolgsmeldungen" ab.

WICHTIG (Datenschutz-Kern der App):
Diese Funktion ist die EINZIGE Stelle, an der aus rohen Workout-/Set-Daten
etwas für Freunde Sichtbares erzeugt wird. Es werden hier bewusst NUR
Zähler/Ereignisse gespeichert (z.B. "3x diese Woche"), niemals Gewichte,
Wiederholungen oder Übungsnamen im Detail. Die Milestone-Tabelle ist die
einzige Tabelle, die der Friends-Router lesen darf.
"""
from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models


def evaluate_milestones_for_workout(db: Session, user: models.User, workout: models.Workout) -> None:
    _check_weekly_count(db, user)
    _check_new_prs(db, user, workout)


def _check_weekly_count(db: Session, user: models.User) -> None:
    start_of_week = datetime.utcnow() - timedelta(days=datetime.utcnow().weekday())
    start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)

    count = (
        db.query(func.count(models.Workout.id))
        .filter(models.Workout.user_id == user.id, models.Workout.date >= start_of_week)
        .scalar()
    )

    # Nur bei runden Meilensteinen (3, 5, 7 Trainings) eine neue Meldung erzeugen,
    # und nicht doppelt für denselben Zähler in derselben Woche.
    if count in (3, 5, 7):
        message = f"{user.username} war diese Woche schon {count}x im Gym 💪"
        already_exists = (
            db.query(models.Milestone)
            .filter(
                models.Milestone.user_id == user.id,
                models.Milestone.type == models.MilestoneType.weekly_gym_count,
                models.Milestone.created_at >= start_of_week,
                models.Milestone.message == message,
            )
            .first()
        )
        if not already_exists:
            db.add(models.Milestone(
                user_id=user.id,
                type=models.MilestoneType.weekly_gym_count,
                message=message,
            ))
            db.commit()


def _check_new_prs(db: Session, user: models.User, workout: models.Workout) -> None:
    for entry in workout.sets:
        if entry.weight is None:
            continue  # Cardio-Sätze (Zeit statt Gewicht) haben keinen PR im klassischen Sinn

        previous_max = (
            db.query(func.max(models.SetEntry.weight))
            .join(models.Workout)
            .filter(
                models.Workout.user_id == user.id,
                models.SetEntry.exercise_id == entry.exercise_id,
                models.Workout.id != workout.id,
            )
            .scalar()
        )
        if previous_max is not None and entry.weight > previous_max:
            exercise_name = entry.exercise.name if entry.exercise else "einer Übung"
            message = f"{user.username} hat einen neuen PR bei {exercise_name} aufgestellt 🏆"
            db.add(models.Milestone(
                user_id=user.id,
                type=models.MilestoneType.new_pr,
                message=message,
            ))
    db.commit()
