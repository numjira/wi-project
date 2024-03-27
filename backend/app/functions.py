from typing import Any, List
import asyncpg.pgproto.pgproto as pgproto
from fastapi.security import APIKeyHeader
from fastapi import Depends, HTTPException
from starlette import status
from datetime import datetime, tzinfo
import os

# load config from .env to get X-API-KEY list
X_API_KEY = APIKeyHeader(name="X-API-Key")
# API_KEY = os.environ.get("API_KEY")
API_KEY = "YOUR_API_KEY"


def api_key_auth(x_api_key: str = Depends(X_API_KEY)):
    # this function is used to validate X-API-KEY in request header
    # if the sent X-API-KEY in header is not existed in the config file
    #   reject access
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Forbidden"
        )
