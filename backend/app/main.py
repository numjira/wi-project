import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Any,Optional,Union


# need import models for auto create
from app.routers import commons_routers,static_routers
from app.dependencies import get_common_pg_async_db

app = FastAPI()

origins = ["*"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(commons_routers(get_common_pg_async_db), prefix="/api/commons")
app.include_router(static_routers(get_common_pg_async_db), prefix="/api/static")
app.mount("/api/static", StaticFiles(directory="uploaded_files"), name="/api/static")



