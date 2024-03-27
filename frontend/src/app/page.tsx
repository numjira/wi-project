"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  Table,
  Form,
  Select,
  InputNumber,
  Popconfirm,
  Typography,
  Popover,
  Upload,
  message,
  Image,
  Tooltip,
} from "antd";
import FormItem from "antd/es/form/FormItem";
// import Image from "next/image";
import {
  UploadOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { UploadProps, UploadFile } from "antd";
import environment from "@/app/utils/environment";
import axiosInstance from "@/app/utils/axios";

const { Search } = Input;

//this code from ant D
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
  const time_thai = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(
    2,
    "0"
  )} ${String(currentDate.getHours()).padStart(2, "0")}:${String(
    currentDate.getMinutes()
  ).padStart(2, "0")}:${String(currentDate.getSeconds()).padStart(2, "0")}`;

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
    // console.log("Edit Data : ", upsertItem);
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
        // console.log("Saved Item:", savedItem);

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
            const response = await axiosInstance.post(
              "/commons/upload",
              formData
            );
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
    showData();
    console.log("image change");
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
      const response_process = await axiosInstance.get("/commons/get_process", {
        params: {
          line_name: line_name,
        },
      });
      if (response_process.status === 200) {
        set_process(response_process.data.process_name);
        // console.log("Process", Process);
      }
      // console.log(`selected ${value}`);
    } catch (err) {
      console.error(err);
    }
  };

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

  //***************API post (post_edit_data)**********condition for post use with add row (true)***********
  const post_edit_data = async (upsertItem: EditData) => {
    try {
      const response = await axiosInstance.post(
        "/commons/post_edit_data",
        upsertItem
      );
      if (response.status === 200) {
        message.success("Post successfully");
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

  const showData = async () => {
    const line_name = form.getFieldValue("LineName") || "0";
    const process = form.getFieldValue("Process") || "0";
    // const part_number = form.getFieldValue("PartNumber");
    const response_wi = await axiosInstance.get("/commons/get_wi_data");
    const responsedata = await axiosInstance.get("/commons/get_wi_table", {
      params: {
        line_name: line_name,
        process: process,
        // part_number: part_number,
      },
    });
    if (responsedata.status === 200) {
      const dataWithKeys = responsedata.data.map(
        (item: any, index: number) => ({
          key: (index + 1).toString(),
          ...item,
        })
      );
      set_data(dataWithKeys);
      // console.log("data on table :", dataWithKeys);
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
  };

  const onSaveButtonClick = async (record: any) => {
    set_show_upload(false);
    save(record.key);
    // console.log("add",add_row_click)
    // console.log("show up",show_upload)
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
                    style={{
                      background: "#5c5eff",
                      color: "white",
                      boxShadow: "5px 5px 20px 0px rgba(5, 50, 50, .5)",
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
      width: 150,
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        return (
          <span
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            {editable ? (
              <span>
                <Tooltip title="Save">
                  <Typography.Link
                    onClick={() => onSaveButtonClick(record)}
                    style={{
                      backgroundColor: "#68c3cf",
                      boxShadow: "3px 3px 10px 0px #16656f",
                      borderRadius: "20px",
                      padding: "10px",
                      color: "white",
                      marginRight: "10px",
                    }}
                    className="fa fa-save"
                  >
                    <SaveOutlined
                      style={{ fontSize: "20px", textAlign: "center" }}
                    />
                  </Typography.Link>
                </Tooltip>

                <Tooltip title="Cancel">
                  <Typography.Link
                    onClick={cancel}
                    style={{
                      backgroundColor: "#cfc768",
                      boxShadow: "3px 3px 10px 0px #746b0a",
                      borderRadius: "20px",
                      padding: "10px",
                      color: "white",
                      marginLeft: "10px",
                    }}
                  >
                    <CloseOutlined style={{ fontSize: "20px" }} />
                  </Typography.Link>
                </Tooltip>
              </span>
            ) : (
              <span style={{ borderWidth: "200px" }}>
                <Tooltip title="Edit">
                  <Typography.Link
                    disabled={editingKey !== "" && editingKey !== record.key}
                    onClick={() => {
                      edit(record);
                      set_show_upload(!show_upload);
                    }}
                    style={{
                      backgroundColor: "#139a40",
                      boxShadow: "3px 3px 10px 0px #0b430f",
                      borderRadius: "20px",
                      padding: "10px",
                      color: "white",
                      marginRight: "10px",
                    }}
                  >
                    <EditOutlined style={{ fontSize: "20px" }} />
                  </Typography.Link>
                </Tooltip>

                <Tooltip title="Delete">
                  <Popconfirm
                    disabled={editingKey !== "" && editingKey !== record.key}
                    title="Sure to delete?"
                    onConfirm={async () => {
                      const ID = {
                        id: record.id,
                      };
                      onDeleteButtonClick(record.key);
                      delete_row(ID);
                    }}
                  >
                    <a
                      style={{
                        backgroundColor: "#ff4646",
                        boxShadow: "3px 3px 10px 0px #570c0c",
                        borderRadius: "20px",
                        padding: "10px",
                        color: "white",
                        marginLeft: "10px",
                      }}
                    >
                      <DeleteOutlined style={{ fontSize: "20px" }} />
                    </a>
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
            // boxShadow: "5px 5px 20px 0px rgba(50, 50, 50, .5)",
            border: "solid lightgray 2px",
            flex: "1",
            display: "flex",
            flexDirection: "column",
            // width: 900,
            // height: 150,
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
                // onChange={LineNameChange}
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
              label={
                <span className="custom-label" style={{ fontSize: 20 }}>
                  Monitor Id
                </span>
              }
            >
              <span style={{ fontSize: 20, fontWeight: "bold", color: "red" }}>
                {" "}
                {(() => {
                  const processDisplay = form.getFieldValue("Process");
                  switch (processDisplay) {
                    case "Housing assembly":
                      return "Display 1 (RA 1)";
                    case "Clutch & Pinion assembly":
                      return "Display 2 (RA 2)";
                    case "Magnetic sw. assembly":
                      return "Display 3 (RA 3)";
                    case "Armature & Yoke assembly":
                      return "Display 4 (RA 4)";
                    case "End frame assembly":
                      return "Display 4 (RA 4)";
                    case "Cover assembly":
                      return "Display 4 (RA 4)";
                    case "Bolt Through assembly":
                      return "Display 4 (RA 4)";
                    default:
                      return null;
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
                onClick={showData}
                htmlType="submit"
                style={{
                  fontSize: 15,
                  color: "white",
                  backgroundColor: "#5c5eff",
                  boxShadow: "3px 3px 10px 0px #0e2563",
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
            <Tooltip title="Add a row">
              <Button
                onClick={() => {
                  onAddButtonClick();
                  set_add_row_click(true);
                }}
                type="primary"
                style={{
                  backgroundColor: "#5c5eff",
                  boxShadow: "3px 3px 10px 0px #0e2563",
                }}
                icon={<PlusOutlined />}
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
                },
              }}
              dataSource={data}
              columns={mergedColumns}
              onRow={(record) => ({
                onClick: async () => {
                  console.log(record);
                },
              })}
              rowClassName="editable-row"
              pagination={false}
              scroll={{ y: 550 }}
              rowKey={(record) => record.key}
              style={{ paddingBottom: "0.5rem" }}
            />
          </div>
        </Form>
      </div>
    </div>
  );
};
export default App;
