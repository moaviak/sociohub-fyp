import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./custom.css";

interface EditorProps {
  value?: string;
  setValue: (value: string) => void;
}

export const Editor = ({ value, setValue }: EditorProps) => {
  return <ReactQuill theme="snow" value={value} onChange={setValue} />;
};
