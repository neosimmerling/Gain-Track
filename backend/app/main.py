from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from .config import settings
from . import models
from .routers import auth, exercises, workouts, stats, milestones

Base.metadata.create_all(bind=engine)


def seed_default_exercises():
    defaults = [
        ("Bankdrücken", "Push", "kg"),
        ("Kniebeuge", "Legs", "kg"),
        ("Kreuzheben", "Pull", "kg"),
        ("Schulterdrücken", "Push", "kg"),
        ("Klimmzug", "Pull", "kg"),
        ("Beinpresse", "Legs", "kg"),
    ]
    db = SessionLocal()
    try:
        existing_names = {e.name for e in db.query(models.Exercise).filter(models.Exercise.owner_id.is_(None)).all()}
        for name, category, unit in defaults:
            if name not in existing_names:
                db.add(models.Exercise(name=name, category=category, unit=unit, owner_id=None))
        db.commit()
    finally:
        db.close()


seed_default_exercises()

app = FastAPI(title="GainTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(exercises.router)
app.include_router(workouts.router)
app.include_router(stats.router)
app.include_router(milestones.router)


@app.get("/health")
def health():
    return {"status": "ok"}
