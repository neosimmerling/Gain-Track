from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from .config import settings
from . import models
from .routers import auth, exercises, workouts, stats, milestones, templates

Base.metadata.create_all(bind=engine)


def seed_default_exercises():
    defaults = [
        # --- Push (Brust / Schulter / Trizeps) ---
        ("Bankdrücken (Langhantel)", "Push", "kg"),
        ("Bankdrücken (Kurzhantel)", "Push", "kg"),
        ("Schrägbankdrücken (Langhantel)", "Push", "kg"),
        ("Schrägbankdrücken (Kurzhantel)", "Push", "kg"),
        ("Negativbankdrücken", "Push", "kg"),
        ("Enges Bankdrücken (Trizeps)", "Push", "kg"),
        ("Butterfly / Fliegende (Kabelzug)", "Push", "kg"),
        ("Fliegende (Kurzhantel)", "Push", "kg"),
        ("Dips (Brust, vorgeneigt)", "Push", "kg"),
        ("Dips (Trizeps, aufrecht)", "Push", "kg"),
        ("Schulterdrücken (Langhantel)", "Push", "kg"),
        ("Schulterdrücken (Kurzhantel)", "Push", "kg"),
        ("Schulterdrücken (Maschine)", "Push", "kg"),
        ("Seitheben (Kurzhantel)", "Push", "kg"),
        ("Seitheben (Kabelzug)", "Push", "kg"),
        ("Frontheben", "Push", "kg"),
        ("Trizepsdrücken (Kabel, Seil)", "Push", "kg"),
        ("Trizepsdrücken (Kabel, Stange)", "Push", "kg"),
        ("Trizeps überkopf (Kurzhantel)", "Push", "kg"),

        # --- Pull (Rücken / Bizeps) ---
        ("Kreuzheben (konventionell)", "Pull", "kg"),
        ("Kreuzheben (Sumo)", "Pull", "kg"),
        ("Rumänisches Kreuzheben", "Pull", "kg"),
        ("Klimmzüge (Obergriff, breit)", "Pull", "kg"),
        ("Klimmzüge (Untergriff)", "Pull", "kg"),
        ("Klimmzüge (eng, neutral)", "Pull", "kg"),
        ("Latzug (breiter Griff)", "Pull", "kg"),
        ("Latzug (enger Griff)", "Pull", "kg"),
        ("Latzug (Untergriff)", "Pull", "kg"),
        ("Rudern vorgebeugt (Langhantel)", "Pull", "kg"),
        ("Rudern einarmig (Kurzhantel)", "Pull", "kg"),
        ("Kabelrudern (sitzend, eng)", "Pull", "kg"),
        ("Kabelrudern (sitzend, breit)", "Pull", "kg"),
        ("T-Bar-Rudern", "Pull", "kg"),
        ("Bizepscurls (Langhantel)", "Pull", "kg"),
        ("Bizepscurls (Kurzhantel)", "Pull", "kg"),
        ("Hammercurls", "Pull", "kg"),
        ("Konzentrationscurls", "Pull", "kg"),

        # --- Legs (Beine / Gesäß) ---
        ("Kniebeuge (Langhantel, Rücken)", "Legs", "kg"),
        ("Frontkniebeuge", "Legs", "kg"),
        ("Beinpresse", "Legs", "kg"),
        ("Beindrücken (Maschine)", "Legs", "kg"),
        ("Ausfallschritte (Kurzhantel)", "Legs", "kg"),
        ("Bulgarian Split Squats", "Legs", "kg"),
        ("Beinstrecker", "Legs", "kg"),
        ("Beinbeuger (liegend)", "Legs", "kg"),
        ("Beinbeuger (sitzend)", "Legs", "kg"),
        ("Wadenheben (stehend)", "Legs", "kg"),
        ("Wadenheben (sitzend)", "Legs", "kg"),
        ("Hip Thrust", "Legs", "kg"),

        # --- Core ---
        ("Crunches", "Core", "kg"),
        ("Plank", "Core", "kg"),
        ("Beinheben (hängend)", "Core", "kg"),
        ("Russian Twists", "Core", "kg"),
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
app.include_router(templates.router)


@app.get("/health")
def health():
    return {"status": "ok"}
