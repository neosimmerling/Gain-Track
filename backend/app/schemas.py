from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Auth ----------

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    username: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Exercises ----------

class ExerciseCreate(BaseModel):
    name: str
    category: Optional[str] = None
    unit: str = "kg"


class ExerciseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    category: Optional[str] = None
    unit: str
    owner_id: Optional[int] = None


# ---------- Sets / Workouts ----------

class SetEntryCreate(BaseModel):
    exercise_id: int
    set_number: int = 1
    reps: int
    weight: float
    rpe: Optional[float] = None


class SetEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    exercise_id: int
    exercise_name: Optional[str] = None
    set_number: int
    reps: int
    weight: float
    rpe: Optional[float] = None


class WorkoutCreate(BaseModel):
    date: Optional[datetime] = None
    notes: Optional[str] = None
    sets: list[SetEntryCreate] = []


class WorkoutOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    date: datetime
    notes: Optional[str] = None
    sets: list[SetEntryOut] = []


# ---------- Stats ----------

class ExerciseProgressPoint(BaseModel):
    date: datetime
    max_weight: float
    total_volume: float


# ---------- Milestones ----------

class MilestoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    type: str
    message: str
    created_at: datetime


# ---------- Friendships ----------

class FriendRequestCreate(BaseModel):
    username: str


class FriendOut(BaseModel):
    id: int
    username: str
    status: str
