from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator



def static_routers(db: AsyncGenerator) -> APIRouter:
    router = APIRouter()

    @router.post("/temp")
    async def dummy():
        return {"msg": "temp file uploaded"}

    return router
