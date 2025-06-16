import React, { useImperativeHandle, forwardRef, useRef, useEffect, useCallback } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize";
import "react-quill/dist/quill.snow.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
Quill.register("modules/imageResize", ImageResize);

interface QuillEditorProps {
  token: string;
  content: string;
  setContent: (value: string) => void;
  existingContent?: string;
  readOnly?: boolean;
}

export interface QuillEditorHandle {
  getHTML: () => string;
}

const QuillEditor = forwardRef<QuillEditorHandle, QuillEditorProps>(
  ({ token, content, setContent, existingContent, readOnly }, ref) => {
    const quillRef = useRef<ReactQuill>(null);

    useImperativeHandle(ref, () => ({
      getHTML: () => {
        return quillRef.current?.editor?.root.innerHTML || "";
      },
    }));

    const handleImageUpload = useCallback(() => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          const editor = quillRef.current?.editor;
          if (editor) {
            const range = editor.getSelection();
            if (range) {
              editor.insertEmbed(range.index, "image", reader.result as string);
              editor.setSelection(range.index + 1);
            }
          }
        };
        reader.readAsDataURL(file);
      };
    }, []);

    useEffect(() => {
      if (existingContent) {
        const doc = new DOMParser().parseFromString(existingContent, "text/html");
        const imgs = doc.querySelectorAll("img");
        const used = new Set<string>();
        imgs.forEach((img) => {
          if (img.src) used.add(img.src);
        });
      }
    }, [existingContent]);

    const quillModules = {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }, { font: [] }, { size: [] }],
          ["bold", "italic", "underline", "strike", "code"],
          [
            { color: [] },
            {
              background: [
                "transparent",
                "#f28b82",
                "#fbbc04",
                "#fff475",
                "#ccff90",
                "#a7ffeb",
                "#cbf0f8",
                "#aecbfa",
                "#d7aefb",
                "#fdcfe8",
                "#e6c9a8",
                "#e8eaed",
                "#f5f5f5",
                "#000000",
              ],
            },
          ],
          ["link", "image"],
          [{ align: [] }, { list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          ["blockquote", "code-block"],
          ["clean"],
        ],
        handlers: {
          image: handleImageUpload,
        },
      },
      clipboard: { matchVisual: false },
      imageResize: { modules: ["Resize", "DisplaySize"] },
      history: { delay: 1000, maxStack: 500, userOnly: true },
    };

    return (
      <ReactQuill
        ref={quillRef}
        className="quill"
        readOnly={readOnly}
        value={content}
        onChange={setContent}
        modules={quillModules}
      />
    );
  }
);

export default QuillEditor;
