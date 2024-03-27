from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator, List, Optional, Annotated
import random
import json
import string
import os
from app.schemas.commons import (
    DataInitalsResponse,DataInitals,ListDataWi,DataWi,LineName, process_data,process_dataResponse,part_number_data,wi_table,delete_a_row
)
from app.manager import CommonsManager
from app.functions import api_key_auth


def commons_routers(db: AsyncGenerator) -> APIRouter:
    router = APIRouter()
    manager = CommonsManager()

    @router.get(
        "/get_data_initials",
        response_model=DataInitalsResponse,
        dependencies=[Depends(api_key_auth)],
    )
    async def get_data_initials(db: AsyncSession = Depends(db)):
        try:
            data_initials = await manager.get_data_initials(db=db)
            return DataInitalsResponse(data=data_initials)
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error during get data : {e}"
            )
        
    @router.get(
        "/get_wi_data",
        response_model=List[DataWi],
        dependencies=[Depends(api_key_auth)],
    )
    async def get_wi_data(db: AsyncSession = Depends(db)):
        try:
            data_wi = await manager.get_wi_data(db=db)
            return list(data_wi)
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error during get data : {e}"
            )
        
    @router.get(
        "/get_linename",
        response_model=List[LineName],
        dependencies=[Depends(api_key_auth)],
    )
    async def get_linename(db: AsyncSession = Depends(db)):
        try:
            line_name = await manager.get_linename(db=db)
            return list(line_name)
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error during get data : {e}"
            )
        
    @router.get(
        "/get_process",
        response_model=process_dataResponse,
        dependencies=[Depends(api_key_auth)],
    )
    async def get_process(line_name=str,db: AsyncSession = Depends(db)):
        try:
            process = await manager.get_process(line_name=line_name,db=db)
            return process_dataResponse(process_name=process)
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error during get data : {e}"
            )
        
    @router.get(
        "/get_part_number",
        response_model=part_number_data,
        dependencies=[Depends(api_key_auth)],
    )
    async def get_part_number(line_name=str,process=str,db: AsyncSession = Depends(db)):
        try:
            part_number = await manager.get_part_number(line_name=line_name,process=process,db=db)
            return part_number_data(part_number_name=part_number)
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error during get data : {e}"
            )


    @router.get(
        "/get_wi_table",
        response_model=List[wi_table],
        dependencies=[Depends(api_key_auth)],
    )
    async def get_wi_table(line_name=str,process=str,part_number=str,db: AsyncSession = Depends(db)):
        try:
            wi_table = await manager.get_wi_table(line_name=line_name,process=process,db=db)
            # ,part_number=part_number
            return list(wi_table)
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error during get data : {e}"
            )


    @router.put(
        "/update_data",
        dependencies=[Depends(api_key_auth)],
    )
    async def update_data(item:DataInitals,db: AsyncSession = Depends(db)):
        try:
            item.image_path = json.dumps(item.image_path)
            update_data = await manager.update_data(item,db=db)
            return {"success": True}
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error during update : {e}"
            )
        

        
    @router.post(
        "/post_edit_data",
        dependencies=[Depends(api_key_auth)],
    )
    async def post_edit_data(item:DataWi,db: AsyncSession = Depends(db)):
        print("hello",item)
        try:
            item.image_path = json.dumps(item.image_path)
            post_edit_data = await manager.post_edit_data(item=item,db=db)
            return {"success": True}
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error during update : {e}"
            )
    
    @router.put(
        "/put_edit_wi",
        dependencies=[Depends(api_key_auth)],
    )
    async def put_edit_wi(item: DataWi, db: AsyncSession = Depends(db)):
        try:
            item.image_path = json.dumps(item.image_path)
            update_data = await manager.put_edit_wi(item, db=db) ##item=item
            return {"success": True}
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error during update : {e}")
        
    @router.post(
        "/delete_row",
        dependencies=[Depends(api_key_auth)],
    )
    async def delete_row(item:delete_a_row,db: AsyncSession = Depends(db)):
        print("hello555",item)
        try:
            delete_row = await manager.delete_row(item=item,db=db)
            return {"success": True}
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error during update : {e}"
            )


    @router.post("/upload", response_model=List[dict])
    async def create_upload_file(file_uploads: list[UploadFile]):
        file_info_list = []
        for file_upload in file_uploads:
            try:
                data = await file_upload.read()
                rd = "".join(
                    random.SystemRandom().choice(string.ascii_uppercase + string.digits)
                    for _ in range(8)
                )
                file_name = f"{rd}_{file_upload.filename}"
                file_path = os.path.join("uploaded_files", file_name)
                with open(file_path, "wb") as f:
                    f.write(data)
                url = f"/static/{file_name}"
                file_info = {"local_path": file_path, "url": url}
                file_info_list.append(file_info)
            except Exception as e:
                raise HTTPException(
                    status_code=500, detail=f"Error processing file: {str(e)}"
                )
        return file_info_list


    return router




    # @router.post("/upload", response_model=List[dict])
    # async def create_upload_file(file_uploads: list[UploadFile]):
    #     print(file_uploads)
    #     file_info_list = []
    #     for file_upload in file_uploads:
    #         try:
    #             data = await file_upload.read()
    #             rd = "".join(
    #                 random.SystemRandom().choice(string.ascii_uppercase + string.digits)
    #                 for _ in range(8)
    #             )
    #             file_name = f"{rd}_{file_upload.filename}"
    #             file_path = os.path.join("uploaded_files",file_name)
    #             # file_path = "\\\\192.168.2.115\\uploaded_files\\"+file_name
    #             print(file_path)
    #             with open(file_path, "wb") as f:
    #                 f.write(data)
    #             session = ftplib.FTP('192.168.2.115') 
    #             session.login()   
    #             file = open(file_path,'rb')         # file to send
    #             session.storbinary('STOR kitten.jpg', file)                # close file and FTP
    #             file.close()
    #             session.quit()
    #             url = f"/static/{file_name}"
    #             file_info = {"local_path": file_path, "url": url}
    #             file_info_list.append(file_info)
    #         except Exception as e:
    #             raise HTTPException(
    #                 status_code=500, detail=f"Error processing file: {str(e)}"
    #             )
    #     return file_info_list
    # return router
