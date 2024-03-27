interface Item {
  key: string;
  id: number;
  part_number: string;
  plc_data: string;
  image_path: any;
  update_time: string;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "number" | "text";
  record: Item;
  index: number;
  children: React.ReactNode;
}

type EditData = {
  line_name: any;
  process: any;
  part_number: string;
  plc_data: string;
  image_path: any;
};

type UpData = {
  id: number;
  line_name: any;
  process: any;
  part_number: string;
  plc_data: string;
  image_path: any;
};

type id_row = {
  id: number;
};

