from fastapi import APIRouter, HTTPException, Depends
from app.schemas import Comment
from app.database import comments_collection
from datetime import datetime
from bson import ObjectId
from app.auth import get_current_user

router = APIRouter()

@router.post("/", status_code=201)
def add_comment(
    comment: Comment,
    user=Depends(get_current_user)
):
    comment_dict = comment.dict()
    comment_dict["created_at"] = datetime.utcnow()
    comment_dict["username"] = user["username"]  

    result = comments_collection.insert_one(comment_dict)
    if not result.acknowledged:
        raise HTTPException(status_code=500, detail="Failed to save comment.")
    return {"message": "Comment added successfully", "id": str(result.inserted_id)}

@router.get("/{hotel_name}")
def get_comments(hotel_name: str):
    comments = list(comments_collection.find({"hotel_name": hotel_name}))
    for c in comments:
        c["id"] = str(c["_id"])
        del c["_id"]
    return {"comments": comments}
