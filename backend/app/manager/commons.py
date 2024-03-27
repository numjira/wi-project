from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import CommonsCRUD
from app.schemas.commons import (
DataInitals,DataWi,LineName, process_data,part_number,wi_table,delete_a_row
)
import json
from typing import Optional, List, Dict, Any, Union
import datetime


class CommonsManager:
    def __init__(self) -> None:
        self.crud = CommonsCRUD()

    async def get_data_initials(
        self,
        db: AsyncSession = None,
    ):
        res = await self.crud.get_data_initials(db=db)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                DataInitals(
                    id=r[key_index["id"]],
                    part_no=r[key_index["part_no"]],
                    plc_data=r[key_index["plc_data"]],
                    updated_at=r[key_index["updated_at"]],
                    created_at=r[key_index["created_at"]],
                    image_path=r[key_index["image_path"]],
                )
            )
        return return_list
    
    async def update_data(
        self,
        item: DataInitals,
        db: AsyncSession = None,
    ):
        await self.crud.update_data(db=db, item=item)
        return True


    async def get_wi_data(
        self,
        db: AsyncSession = None,
    ):
        res = await self.crud.get_wi_data(db=db)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                DataWi(
                    id=r[key_index["id"]],
                    line_name=r[key_index["line_name"]],
                    process=r[key_index["process"]],
                    plc_data=r[key_index["plc_data"]],
                    part_number=r[key_index["part_number"]],
                    update_time=r[key_index["update_time"]],
                    image_path=r[key_index["image_path"]],
                )
            )
        return return_list
    

    async def get_linename(
        self,
        db: AsyncSession = None,
    ):
        res = await self.crud.get_wi_data(db=db)
        return_list = []
        for r in res:
            key_index = r._key_to_index
            return_list.append(
                LineName(
                    line_name=r[key_index["line_name"]],
                )
            )
        return return_list
    

    async def get_process(
        self,
        line_name=str,
        db: AsyncSession = None,
    ):
        print("manager",line_name)
        res = await self.crud.get_process(db=db,line_name=line_name)
        return_list = []
        for r in res:
            print(r)
            key_index = r._key_to_index
            return_list.append(
                process_data(
                    process=r[key_index["process"]],
                )
            )
        return return_list
    

    async def get_part_number(
        self,
        line_name=str,
        process=str ,
        db: AsyncSession = None,
    ):
        res = await self.crud.get_part_number(db=db,line_name=line_name,process=process)
        return_list = []
        for r in res:
            print(r)
            key_index = r._key_to_index
            return_list.append(
                part_number(
                    part_number=r[key_index["part_number"]],
                )
            )
        return return_list


    async def get_wi_table(
        self,
        line_name=str,
        process=str ,
        # part_number=str,
        db: AsyncSession = None,
    ):
        res = await self.crud.get_wi_table(db=db,line_name=line_name,process=process)
        # ,part_number=part_number
        return_list = []
        for r in res:
            print(r)
            key_index = r._key_to_index
            return_list.append(
                wi_table(
                    id=r[key_index["id"]],
                    part_number=r[key_index["part_number"]],
                    plc_data=r[key_index["plc_data"]],
                    image_path=r[key_index["image_path"]],
                    update_time=r[key_index["update_time"]],
                )
            )
        return return_list
    

    async def post_edit_data(
        self,
        item: DataWi,
        db: AsyncSession = None,
    ):
        print("edit",item)
        await self.crud.post_edit_data(db=db, item=item)
        return True
    

    async def delete_row(
        self,
        item:delete_a_row,
        db:AsyncSession = None,
    ):
        print("delete",item)
        await self.crud.delete_row(db=db, item=item)
        return True
    
    async def put_edit_wi(
            self,
            item:DataWi,
            db:AsyncSession = None,
    ):
        print("update",item)
        await self.crud.put_edit_wi(db=db, item=item)
        return True