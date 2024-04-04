from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text
from fastapi import HTTPException
from typing import Optional, List, Dict, Any, Union
from app.schemas.commons import (
DataInitals,DataWi,delete_a_row
)

def convert_result(res):
    return [{c: getattr(r, c) for c in res.keys()} for r in res]
class CommonsCRUD:
    def __init__(self):
        pass
    
    
    async def get_data_initials(
        self,db: AsyncSession,
    ):
        try:
            stmt = f"""
            SELECT * FROM wi
            """
            rs = await db.execute(
                text(stmt)
            )
            return rs
        except Exception as e:
            print(f"Error during get data: {e}")
            raise HTTPException(status_code=400, detail=f"Bad Requst: {e}")
    

    async def update_data(self, item:DataInitals, db: AsyncSession):
        stmt = f"""
        UPDATE wi
        SET part_no=:part_no, plc_data=:plc_data
        WHERE id = :id;
        """
        rs = await db.execute(text(stmt), params={"id": item.id,"plc_data":item.plc_data,"part_no":item.part_no})
        await db.commit()  # Corrected the missing parentheses
        return rs
    

    async def get_wi_data(
        self,db: AsyncSession,
    ):
        try:
            stmt = f"""
        SELECT * FROM wi_process
        """
            rs = await db.execute(text(stmt))
            return rs
        except Exception as e:
            raise e
    
    async def get_linename(
        self,db: AsyncSession,
    ):
        try:
            stmt = f"""
        SELECT line_name FROM linename
        """
            rs = await db.execute(text(stmt))
            return rs
        except Exception as e:
            raise e

    async def get_process(self,line_name: str,
        db: AsyncSession,
    ):
        try:
            stmt = f"""
        SELECT process FROM process
        WHERE line_name = :line_name ;
        """
            rs = await db.execute(text(stmt),{"line_name": line_name})
            return rs
        except Exception as e:
            raise e
    4
    async def get_part_number(self,line_name: str,process:str,
        db: AsyncSession,
    ):
        try:
            stmt = f"""
        SELECT part_number FROM wi_process
        WHERE line_name =:line_name AND process =:process;
        """
            rs = await db.execute(text(stmt),{"line_name": line_name,"process":process})
            return rs
        except Exception as e:
            raise e
        
    async def get_wi_table(self,line_name: str,process:str,
                        #    part_number:str,
        db: AsyncSession,
    ):
        try:
            # AND part_number = :part_number
            stmt = f"""
        SELECT id, part_number, plc_data, image_path, update_time FROM wi_process
        WHERE line_name = :line_name AND process = :process ;
        """
            rs = await db.execute(text(stmt),{"line_name": line_name,"process":process})
            # ,"part_number":part_number
            return rs
        except Exception as e:
            raise e
    
    async def post_edit_data(self,db: AsyncSession,item:DataWi):
        try:
            stmt = f"""
            INSERT INTO wi_process (line_name, process, part_number, plc_data, image_path, update_time ) 
            VALUES (:line_name, :process, :part_number, :plc_data, cast(:image_path AS jsonb),:update_time )
            ON CONFLICT (line_name, process, part_number)  
            DO UPDATE SET
            line_name = EXCLUDED.line_name,
            process = EXCLUDED.process,
            part_number = EXCLUDED.part_number,
            plc_data = EXCLUDED.plc_data,
            image_path = EXCLUDED.image_path,
            update_time = EXCLUDED.update_time
            """
            rs = await db.execute(
                text(stmt),
                        {
                            "line_name": item.line_name,
                            "process": item.process,
                            "part_number": item.part_number,
                            "plc_data": item.plc_data,
                            "image_path": item.image_path,
                            "update_time": item.update_time
                        }
                    )
            await db.commit()
            return rs
        except Exception as e:
            raise e



    async def delete_row(self,item:delete_a_row, db: AsyncSession):
        try:
            stmt = f"""
            DELETE FROM wi_process
            WHERE id IN (:id) ;
            """
            params ={"id":item.id}
            res = await db.execute(text(stmt), params)
            await db.commit()
            return res
        except Exception as e:
            raise e
        

    async def put_edit_wi(self,item:DataWi, db:AsyncSession):
        try:
            stmt = f"""
            UPDATE wi_process
            SET line_name = :line_name,
                process = :process,
                part_number = :part_number,
                plc_data = :plc_data,
                image_path = cast(:image_path AS jsonb),
                update_time = :update_time
            WHERE id = :id;
            """
            rs = await db.execute(
                    text(stmt),
                            {
                                "line_name": item.line_name,
                                "process": item.process,
                                "part_number": item.part_number,
                                "plc_data": item.plc_data,
                                "image_path": item.image_path,
                                "update_time": item.update_time,
                                "id": item.id,
                            }
                        )
            await db.commit()
            return rs
        except Exception as e:
            raise e

    
    
