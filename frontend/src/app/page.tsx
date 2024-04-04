"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Table,
  Form,
  Select,
  InputNumber,
  Popconfirm,
  Popover,
  Upload,
  message,
  Image,
  Tooltip,
} from "antd";
import FormItem from "antd/es/form/FormItem";
import {
  UploadOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import type { UploadProps, UploadFile } from "antd";
import environment from "@/app/utils/environment";
import axiosInstance from "@/app/utils/axios";

const { Search } = Input;
//this code from antd
const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === "number" ? <InputNumber /> : <Input />;

  return (
    //input part number ,plac data in table
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const App: React.FC = () => {
  //**********************set state***************************
  const [form] = Form.useForm();
  const [linename, set_linename] = useState<any>([]);
  const [Process, set_process] = useState<any>([]);
  const [partnumber, set_partnumber] = useState<any>([]);
  const [maxId, set_max_id] = useState<any>([]);
  const [data, set_data] = useState<any>([]);
  const [add_row_click, set_add_row_click] = useState(false);
  const [show_upload, set_show_upload] = useState(false);
  const [editingKey, set_editing_key] = useState("");
  const [uploadList, set_uploadlist] = useState<UploadFile[]>([]);
  const [default_image, set_defult_image] = useState<any>([]);
  const [searchText, set_search_text] = useState("");
  const [isDisabled, setDisabled] = useState(true);

  //**********************upload image***************************
  const props: UploadProps = {
    name: "file",
    action: `${environment.API_URL}/static/temp`,
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log("info file :", info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
        console.log(info.file, info.fileList);
        set_uploadlist(info.fileList);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  //**********************set time thailand***************************
  const currentDate = new Date();
  const time_thai = `${String(currentDate.getDate()).padStart(2, "")} ${
    ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    [currentDate.getMonth()]
  } ${currentDate.getFullYear()} ${String(
    currentDate.getHours()
  ).padStart(2, "0")} : ${String(currentDate.getMinutes()).padStart(
    2,
    "0"
  )} : ${String(currentDate.getSeconds()).padStart(2, "0")}`;
  // console.log(time_thai);

  useEffect(() => {
    console.log("Data on table :", data);
  }, [data]);

  //**********************edit func on table***************************
  const isEditing = (record: Item) => record.key === editingKey;
  //edit only part_number and plc_data
  const edit = (record: Partial<Item> & { key: React.Key }) => {
    form.setFieldsValue({
      part_number: "",
      plc_data: "",
      ...record,
    });
    set_editing_key(record.key);
  };

  const cancel = () => {
    set_editing_key("");
    set_show_upload(false);
  };
  //save all data in 1 row to database
  const savetoDb = async (savedItem: any, filesPath: any) => {
    savedItem.image_path = filesPath;
    set_defult_image(savedItem.image_path);
    console.log("image_path :", savedItem);
    const line_name = form.getFieldValue("LineName");
    const process = form.getFieldValue("Process");
    const upsertItem = {
      id: savedItem.id,
      line_name: line_name,
      process: process,
      part_number: savedItem.part_number,
      plc_data: savedItem.plc_data,
      image_path: savedItem.image_path,
      update_time: time_thai,
    };
    
    //if click add_row_click do post , if not do update
    if (add_row_click) {
      post_edit_data(upsertItem);
      set_add_row_click(false); // Reset the flag after processing
        console.log("Post Data: ", upsertItem);
    } else {
      update_row(upsertItem);
        console.log("Put Data : ", upsertItem);
    }
  };

  //func. save row
  const save = async (key: React.Key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data]; //spread operator ... clone a new array
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        const updatedItem = { ...item, ...row };

        const part_number_check = newData.every(
          (item) =>
            item.key === key || item.part_number !== updatedItem.part_number
        );

        if (!part_number_check) {
          message.error("Please change the part number, it must be unique!");
          return;
        }

        const { key: omitKey, ...savedItem } = updatedItem;
          newData.splice(index, 1, updatedItem);
          set_data(newData);
          set_editing_key("");
          // console.log(uploadList);

        if (uploadList.length < 1) {
          savetoDb(savedItem, savedItem.image_path);
        } else {
          try {
            const formData = new FormData();
            uploadList.forEach((file) => {
              formData.append("file_uploads", file.originFileObj as File);
            });
            const response = await axiosInstance.post("/commons/upload",formData);
            if (response.status === 200) {
              savetoDb(savedItem, response.data);
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
    } catch (err) {
      console.error("Validate Failed:", err);
    }
  };

  //*********************detect state for change the image when upload on table**************************
  useEffect(() => {
    if (form.getFieldValue("LineName") !== undefined) {
      showData();
    } else {
    }
    console.log("image change");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [default_image]);

  //**********************API response (get_linename)**************************
  const fetch_linename = async () => {
    try {
      const response = await axiosInstance.get("/commons/get_linename");
      if (response.status === 200) {
        set_linename(response.data);
        // console.log(response.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetch_linename();
  }, []);

  //**********************API response (get_process)**************************
  const LineNameChange = async (value: string) => {
    try {
      const line_name = form.getFieldValue("LineName");
      const response_process = await axiosInstance.get(
        `/commons/get_process?line_name=${line_name}`
      );
      // const response_process = await axiosInstance.get(`/commons/get_process?line_name=${line_name}`);
      if (response_process.status === 200) {
        set_process(response_process.data.process_name);
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (form.getFieldValue("LineName") === undefined) {
      setDisabled(true);
      form.resetFields(["Process"]);
    } else {
      form.resetFields(["Process"]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.getFieldValue("LineName")]);



  //**********************API response (get_part_number)**************************
  const PartNumberChange = async (value: string) => {
    try {
      const line_name = form.getFieldValue("LineName");
      const process = form.getFieldValue("Process");

      const responsePartNumber = await axiosInstance.get(
        "/commons/get_part_number",
        {
          params: {
            line_name: line_name,
            process: process,
          },
        }
      );
      if (responsePartNumber.status === 200) {
        set_partnumber(responsePartNumber.data.part_number_name);
        // console.log("part_number", partnumber);
      }
      // console.log(`selected ${value}`);
    } catch (err) {
      console.error(err);
    }
  };
  // /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //***************API post (post_edit_data)**********condition for post use with add row (true)***********
  const post_edit_data = async (upsertItem: EditData) => {
    try {
      const response = await axiosInstance.post(
        "/commons/post_edit_data",
        upsertItem
      );
      if (response.status === 200) {
        message.success("Post successfully");
        
      } else {
        
      }
    } catch (error) {
      console.error("Error post data:", error);
    }
  };
  //**********************API delete (delete_row)**************************
  const delete_row = async (id: id_row) => {
    // console.log("id : ", id);
    try {
      const response = await axiosInstance.post("/commons/delete_row", id);
      if (response.status === 200) {
        message.success("Delete successfully");
      }
    } catch (error) {
      console.error("Error delete data:", error);
    }
  };

  //**********************API update (put_edit_wi)*****condition for post use with edit (true), add row(false)**********
  const update_row = async (upsertItem: UpData) => {
    console.log("Update Row:", upsertItem);
    try {
      const response = await axiosInstance.put(
        "/commons/put_edit_wi",
        upsertItem
      );
      if (response.status === 200) {
        message.success("Update successfully");
      }
    } catch (error) {
      console.error("Error delete data:", error);
    }
  };

  const unique = new Set();

  const distinct_line_name = linename.filter((entry: any) => {
    const isUnique = !unique.has(entry.line_name);
    unique.add(entry.line_name);
    return isUnique;
  });

  const distinct_process = Process.filter((entry: any) => {
    const isUnique = !unique.has(entry.process);
    unique.add(entry.process);
    return isUnique;
  });

  //get data in table ex.image path, plc data, part no., uddate time etc.
  const showData = async () => {
    const line_name = form.getFieldValue("LineName") || "0";
    const process = form.getFieldValue("Process") || "0";
    // const part_number = form.getFieldValue("PartNumber");
    const response_wi = await axiosInstance.get("/commons/get_wi_data");
    const responsedata = await axiosInstance.get("/commons/get_wi_table", {
      params: {
        line_name: line_name,
        process: process,
      },
    });
    if (responsedata.status === 200 && line_name != 0 && process != 0) {
      const dataWithKeys = responsedata.data.map(
        (item: any, index: number) => ({
          key: (index + 1).toString(),
          ...item,
        })
      );
      message.success("Show Data Successfully");
      set_data(dataWithKeys);
      setDisabled(false);
    } else {
      setDisabled(true);
      message.error("Data Not Found ");
    }

    if (response_wi.status === 200) {
      const maxId = Math.max(...response_wi.data.map((item: any) => item.id));
      set_max_id(maxId);
      // console.log("max :", maxId);
    }
  };

  const onDeleteButtonClick = async (key: React.Key) => {
    const newData = data.filter((item: any) => item.key !== key);
    const updatedData = newData.map((item: any, index: any) => ({
      ...item,
      key: String(index + 1),
    }));
    set_data(updatedData);
  };

  const onAddButtonClick = () => {
    if (!editingKey) {
      const newId = maxId + 1;
      const newData: Item = {
        key: String(data.length + 1),
        id: newId,
        part_number: "",
        plc_data: "",
        image_path: [], //default_image
        update_time: time_thai,
      };
      set_data([...data, newData]);
      set_editing_key(newData.key);
    }};

  const onSaveButtonClick = async (record: any) => {
    set_show_upload(false);
    save(record.key);
  };

  const columns = [
    {
      title: "Part number",
      dataIndex: "part_number",
      editable: true,
      onFilter: (value: any, record: any) =>
        record.part_number.toLowerCase().includes(value.toLowerCase()),
      filterIcon: (filtered: any) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      filteredValue: searchText ? [searchText] : null,
      render: (text: string, record: { part_number: string }) => {
        if (!searchText) {
          return <span>{text}</span>;
        }
        const searchRegex = new RegExp(`(${searchText})`, "gi");
        const parts = text.split(searchRegex);
        return (
          <span>
            {parts.map((part, index) =>
              searchRegex.test(part) ? (
                <span key={index} style={{ backgroundColor: "#ffc069" }}>
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </span>
        );
      },
    },
    {
      title: "PLC data",
      dataIndex: "plc_data",
      editable: true,
    },
    {
      title: "Image preview",
      dataIndex: "image_path",
      width: 500,
      render: (image_path: any, record: any) => (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Popover title={record.part_number}>
            {record.image_path.map((image_path: any, index: any) => (
              <div key={`${record.id}-${index}`}>
                <Image
                  src={`${environment.API_URL}${image_path.url}`}
                  alt={`Image ${index}`}
                  height={100}
                  width={200}
                />
                <br />
              </div>
            ))}
          </Popover>
          {/* editKey = key ของ row นั้นๆ ให้แสดง upload */}
          {editingKey === record.key && (
            <>
              <Tooltip title="Upload Image">
                <Upload {...props}>
                  <Button
                    type="primary"
                    style={{
                      boxShadow: "5px 5px 20px 0px",
                      width: "80px",
                    }}
                    icon={<UploadOutlined />}
                  ></Button>
                </Upload>
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Update time",
      dataIndex: "update_time",
      width: 250,
      render: (update_time: string, record: any) => (
        <div>{record.update_time}</div>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      width: 200,
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        return (
          <span
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            {editable ? (
              <span>
                <Tooltip title="Save">
                  <Button
                    type="primary"
                    onClick={() => onSaveButtonClick(record)}
                    style={{
                      boxShadow: "3px 3px 10px ",
                      width: "50px",
                      marginRight: "10px",
                    }}
                    className="fa fa-save"
                  >
                    <SaveOutlined
                      style={{ fontSize: "20px", textAlign: "center" }}
                    />
                  </Button>
                </Tooltip>

                <Tooltip title="Cancel">
                  <Button
                    type="primary"
                    onClick={cancel}
                    style={{
                      boxShadow: "3px 3px 10px 0px",
                      width: "50px",
                      marginLeft: "10px",
                    }}
                  >
                    <CloseOutlined style={{ fontSize: "20px" }} />
                  </Button>
                </Tooltip>
              </span>
            ) : (
              <span style={{ borderWidth: "200px" }}>
                <Tooltip title="Edit">
                  <Button
                    type="primary"
                    disabled={editingKey !== "" && editingKey !== record.key}
                    onClick={() => {
                      edit(record);
                      set_show_upload(!show_upload);
                    }}
                    style={{
                      boxShadow: "3px 3px 10px 0px",
                      width: "50px",
                      marginRight: "10px",
                    }}
                  >
                    <EditOutlined style={{ fontSize: "20px" }} />
                  </Button>
                </Tooltip>

                <Tooltip title="Delete">
                  <Popconfirm
                    title="Sure to delete?"
                    onConfirm={async () => {
                      const ID = {
                        id: record.id,
                      };
                      onDeleteButtonClick(record.key);
                      delete_row(ID);
                    }}
                  >
                    <Button
                      type="primary"
                      danger
                      disabled={editingKey !== "" && editingKey !== record.key}
                      style={{
                        boxShadow: "3px 3px 10px 0px",
                        width: "50px",

                        marginLeft: "10px",
                      }}
                    >
                      <DeleteOutlined style={{ fontSize: "20px" }} />
                    </Button>
                  </Popconfirm>
                </Tooltip>
              </span>
            )}
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: col.dataIndex,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div>
      <div
        style={{
          paddingTop: "1rem",
          // paddingLeft: "30rem",
        }}
      >
        <div
          className="selector"
          style={{
            borderRadius: "5px",

            border: "solid lightgray 2px",
            flex: "1",
            display: "flex",
            flexDirection: "column",

            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "1.5rem",
          }}
        >
          {" "}
          {/* <h1>Admin</h1> */}
          <Form
            form={form}
            style={{ display: "flex", gap: "2rem" }}
            onFinish={(x) => console.log(x)}
          >
            <FormItem
              name="LineName"
              rules={[{ required: true, message: "LineName is required" }]}
              label={
                <span className="custom-label" style={{ fontSize: 20 }}>
                  Line Name
                </span>
              }
            >
              <Select
                showSearch
                placeholder="Select a LineName"
                style={{ width: 250 }}
                onSelect={LineNameChange}
                onChange={LineNameChange}
                allowClear
                // options={uniqueLineName}
              >
                {distinct_line_name.map((item: any) => (
                  <Select.Option key={item.line_name} value={item.line_name}>
                    {item.line_name}
                  </Select.Option>
                ))}
              </Select>
            </FormItem>

            <FormItem
              name="Process"
              rules={[{ required: true, message: "Process is required" }]}
              label={
                <span className="custom-label" style={{ fontSize: 20 }}>
                  Process
                </span>
              }
            >
              <Select
                showSearch
                allowClear
                placeholder="Select a Process"
                style={{ width: 250 }}
                onSelect={PartNumberChange}
                loading={distinct_process.length < 1 ? true : false}
                disabled={distinct_process.length < 1}
              >
                {distinct_process.map((item: any) => (
                  <Select.Option key={item.process} value={item.process}>
                    {item.process}
                  </Select.Option>
                ))}
              </Select>
            </FormItem>

            <FormItem
              name="monitor_id"
              style={{}}
              label={
                <span className="custom-label" style={{ fontSize: 20 }}>
                  Monitor Id
                </span>
              }
            >
              {/*Dispaly show*/}
              <span style={{ fontSize: 20, fontWeight: "bold", color: "red", }}>
                {""}
                {(() => {
                  const processDisplay = form.getFieldValue("Process");
                  switch (processDisplay) {
                    case "Housing assembly":
                      return "Display 1 (RA 1)";
                    case "Clutch & Pinion assembly":
                      return "Display 2 (RA 2)";
                    case "Magnetic SW. assembly":
                      return "Display 3 (RA 3)";
                    case "Armature & Yoke assembly":
                      return "Display 4 (RA 4)";
                    case "End Frame assembly":
                      return "Display 4 (RA 4)";
                    case "Cover assembly":
                      return "Display 4 (RA 4)";
                    case "Bolt Through assembly":
                      return "Display 4 (RA 4)";
                    default:
                      return "No Display Show";
                  }
                })()}
              </span>
            </FormItem>

            <FormItem
              style={{
                display: "flex",
                alignItems: "right",
                justifyContent: "right",
              }}
            >
              <Button
                type="primary"
                onClick={showData}
                htmlType="submit"
                style={{
                  fontSize: 15,
                  boxShadow: "3px 3px 10px 0px ",
                }}
              >
                {" "}
                Search
                <SearchOutlined />
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
      <div style={{ paddingTop: "1.5rem" }}></div>
      <div>
        <Form form={form} component={false}>
          <FormItem
            style={{
              display: "flex",
              alignItems: "right",
              justifyContent: "right",
              paddingRight: "0.5rem",
            }}
          >
            <Search
              placeholder="Filter a part number"
              style={{ width: 300, marginRight: "2rem" }}
              onSearch={(value) => set_search_text(value)}
              allowClear
            />
            <Tooltip title="Add row">
              <Button
                type="primary"
                onClick={() => {
                  onAddButtonClick();
                  set_add_row_click(true);
                }}
                style={{
                  boxShadow: "3px 3px 10px 0px",
                }}
                icon={<PlusOutlined />}
                disabled={isDisabled}
              >
                Add
              </Button>
            </Tooltip>
          </FormItem>
          <div
            style={{
              borderRadius: "10px",
              boxShadow: "5px 5px 20px 0px rgba(50, 50, 50, .5)",
            }}
          >
            <Table
              className="edit_table"
              components={{
                body: {
                  cell: EditableCell,
                }
              }}
              dataSource={data}
              // columns={mergedColumns}
              columns={mergedColumns.map((column) => ({
                ...column,
                title:
                  column.title === "PLC data" ? (
                    <Tooltip title="ข้อมูลจาก PLC ของกระบวนการผลิตชิ้นงาน">
                      <span>
                        PLC data <QuestionCircleOutlined />
                      </span>
                    </Tooltip>
                  ) : (
                    column.title
                  ),
              }))}
              onRow={(record) => ({
                onClick: async () => {
                  console.log(record);
                },
              })}
              rowClassName="editable-row"
              pagination={false}
              scroll={{ y: 590 }}
              rowKey={(record) => record.key}
              style={{ paddingBottom: "0.5rem"}}
            />
          </div>
        </Form>
      </div>
    </div>
  );
};
export default App;
