from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from typing import List,Optional
from pydantic import BaseModel
from fastapi import HTTPException
import datetime


#โครงสร้างภาษา SQL """......"""
# async def get_data(db: Session):
#     try:
#         stmt = f"""
#         SELECT * FROM wi
#         """
#         res = db.execute(text(stmt)) 
#         db.commit()
#     except Exception as e:
#         print(f"Error during post data: {e}")
#         raise HTTPException(status_code=400, detail=f"Bad Request: {e}")
#     return res
