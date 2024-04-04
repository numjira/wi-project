from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union
import datetime


class DataInitals(BaseModel):
    id: int
    part_no:str
    plc_data:str
    updated_at:Optional[datetime.datetime]
    created_at:Optional[datetime.datetime]
    image_path:Optional[List[Dict[str,Any]]] = None
    
class DataInitalsResponse(BaseModel):
    data:List[DataInitals]

################################################
class DataWi(BaseModel):
    id: int
    line_name:str
    process:str
    part_number:str
    plc_data:str
    image_path:Optional[List[Dict[str,Any]]] = None
    update_time:str

class ListDataWi(BaseModel):
    data:List[DataWi]
#################################################
    
class LineName(BaseModel):
    line_name:str

class LineName_data(BaseModel):
    value:List[LineName]

############################
    
class process_data(BaseModel):
    process:str

class process_dataResponse(BaseModel):
    process_name:List[process_data]

#############################
    
class part_number(BaseModel):
    part_number:str

class part_number_data(BaseModel):
    part_number_name:List[part_number]

#############################
    
class wi_table(BaseModel):
    id: int
    part_number:str
    plc_data:str
    image_path:Optional[List[Dict[str,Any]]] = None
    # image_path:str
    update_time:str

class delete_a_row(BaseModel):
    id:Union[int, str]


