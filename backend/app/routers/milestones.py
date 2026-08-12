from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(tags=["milestones"])


@router.get("/milestones/me", response_model=list[schemas.MilestoneOut])
def my_milestones(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return (
        db.query(models.Milestone)
        .filter(models.Milestone.user_id == current_user.id)
        .order_by(models.Milestone.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/friends", response_model=list[schemas.FriendOut])
def list_friends(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    friendships = (
        db.query(models.Friendship)
        .filter(
            or_(
                models.Friendship.requester_id == current_user.id,
                models.Friendship.addressee_id == current_user.id,
            )
        )
        .all()
    )
    result = []
    for f in friendships:
        other_id = f.addressee_id if f.requester_id == current_user.id else f.requester_id
        other = db.query(models.User).get(other_id)
        if other:
            result.append(schemas.FriendOut(id=other.id, username=other.username, status=f.status.value))
    return result


@router.post("/friends/request", status_code=201)
def send_friend_request(
    payload: schemas.FriendRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    target = db.query(models.User).filter(models.User.username == payload.username).first()
    if not target or target.id == current_user.id:
        raise HTTPException(status_code=404, detail="Nutzer nicht gefunden")

    existing = (
        db.query(models.Friendship)
        .filter(
            or_(
                and_(models.Friendship.requester_id == current_user.id, models.Friendship.addressee_id == target.id),
                and_(models.Friendship.requester_id == target.id, models.Friendship.addressee_id == current_user.id),
            )
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Freundschaftsanfrage existiert bereits")

    db.add(models.Friendship(requester_id=current_user.id, addressee_id=target.id))
    db.commit()
    return {"status": "sent"}


@router.post("/friends/{friendship_user_id}/accept")
def accept_friend_request(
    friendship_user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    friendship = (
        db.query(models.Friendship)
        .filter(
            models.Friendship.requester_id == friendship_user_id,
            models.Friendship.addressee_id == current_user.id,
        )
        .first()
    )
    if not friendship:
        raise HTTPException(status_code=404, detail="Anfrage nicht gefunden")
    friendship.status = models.FriendshipStatus.accepted
    db.commit()
    return {"status": "accepted"}


@router.get("/friends/{friend_id}/milestones", response_model=list[schemas.MilestoneOut])
def friend_milestones(
    friend_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Nur Zugriff, wenn eine akzeptierte Freundschaft besteht.
    friendship = (
        db.query(models.Friendship)
        .filter(
            or_(
                and_(models.Friendship.requester_id == current_user.id, models.Friendship.addressee_id == friend_id),
                and_(models.Friendship.requester_id == friend_id, models.Friendship.addressee_id == current_user.id),
            ),
            models.Friendship.status == models.FriendshipStatus.accepted,
        )
        .first()
    )
    if not friendship:
        raise HTTPException(status_code=403, detail="Keine Freundschaft mit diesem Nutzer")

    # Diese Query liest ausschließlich die Milestone-Tabelle - niemals Workouts/SetEntries.
    return (
        db.query(models.Milestone)
        .filter(models.Milestone.user_id == friend_id)
        .order_by(models.Milestone.created_at.desc())
        .limit(20)
        .all()
    )
