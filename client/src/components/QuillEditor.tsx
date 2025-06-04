// components/QuillEditor.tsx
import React, { useRef, useCallback, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface QuillEditorProps {
  token: string;
  content: string;
  setContent: (value: string) => void;
  uploadedImages: Set<string>;
  setUploadedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
  existingContent?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  token,
  content,
  setContent,
  uploadedImages,
  setUploadedImages,
  existingContent,
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const addUploadedImage = (url: string) => {
    setUploadedImages((prev) => new Set(prev).add(url));
  };

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch(`${API_BASE_URL}/api/image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.imageUrl) return;
        addUploadedImage(data.imageUrl);

        const editor = quillRef.current?.editor;
        if (!editor) return;

        setTimeout(() => {
          const range = editor.getSelection();
          if (range) {
            editor.insertEmbed(range.index, "image", data.imageUrl);
            editor.setSelection(range.index + 1);
          }
        }, 0);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    };
  }, [token]);

  useEffect(() => {
    if (existingContent) {
      const doc = new DOMParser().parseFromString(existingContent, "text/html");
      const imgs = doc.querySelectorAll("img");
      const used = new Set<string>();
      imgs.forEach((img) => {
        if (img.src) used.add(img.src);
      });
      setUploadedImages(new Set(used));
    }
  }, [existingContent, setUploadedImages]);

  const quillModules = {
    toolbar: {
      container: [
        [{ header: "1" }, { header: "2" }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["bold", "italic", "underline"],
        [{ align: [] }],
        ["link", "image"],
        [{ indent: "-1" }, { indent: "+1" }],
        ["blockquote"],
        [{ color: [] }, { background: [] }],
      ],
      handlers: {
        image: handleImageUpload,
      },
    },
  };

  return <ReactQuill ref={quillRef} className="quill" value={content} onChange={setContent} modules={quillModules} />;
};

export default QuillEditor;
