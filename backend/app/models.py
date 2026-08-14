import enum
from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Float, Text, Enum, UniqueConstraint
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    workouts = relationship("Workout", back_populates="user", cascade="all, delete-orphan")
    exercises = relationship("Exercise", back_populates="owner", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="user", cascade="all, delete-orphan")
    templates = relationship("WorkoutTemplate", back_populates="user", cascade="all, delete-orphan")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=True)  # e.g. "Push", "Pull", "Legs", "Cardio"
    unit = Column(String, default="kg")
    # owner_id is NULL for global/shared exercises (seeded defaults), set for user-created ones
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    owner = relationship("User", back_populates="exercises")
    set_entries = relationship("SetEntry", back_populates="exercise")

    __table_args__ = (UniqueConstraint("name", "owner_id", name="uq_exercise_name_owner"),)


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(DateTime, default=datetime.utcnow, index=True)
    notes = Column(Text, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    template_id = Column(Integer, ForeignKey("workout_templates.id"), nullable=True)

    user = relationship("User", back_populates="workouts")
    sets = relationship("SetEntry", back_populates="workout", cascade="all, delete-orphan", order_by="SetEntry.set_number")


class SetEntry(Base):
    __tablename__ = "set_entries"

    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False, index=True)
    set_number = Column(Integer, nullable=False, default=1)
    reps = Column(Integer, nullable=False)
    weight = Column(Float, nullable=False, default=0)
    rpe = Column(Float, nullable=True)

    workout = relationship("Workout", back_populates="sets")
    exercise = relationship("Exercise", back_populates="set_entries")


class MilestoneType(str, enum.Enum):
    weekly_gym_count = "weekly_gym_count"
    new_pr = "new_pr"
    streak = "streak"


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(Enum(MilestoneType), nullable=False)
    message = Column(String, nullable=False)  # pre-rendered, non-sensitive text e.g. "Neo war 3x diese Woche im Gym"
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="milestones")


class FriendshipStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"


class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    addressee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(Enum(FriendshipStatus), default=FriendshipStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("requester_id", "addressee_id", name="uq_friendship_pair"),)


class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)  # z.B. "Push Day A"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="templates")
    items = relationship(
        "TemplateExercise",
        back_populates="template",
        cascade="all, delete-orphan",
        order_by="TemplateExercise.order_index",
    )


class TemplateExercise(Base):
    __tablename__ = "template_exercises"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("workout_templates.id"), nullable=False, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False, index=True)
    order_index = Column(Integer, nullable=False, default=0)
    target_sets = Column(Integer, nullable=True)
    target_reps = Column(String, nullable=True)  # z.B. "8-12", freitext
    notes = Column(String, nullable=True)  # z.B. "Untergriff, eng"

    template = relationship("WorkoutTemplate", back_populates="items")
    exercise = relationship("Exercise")
