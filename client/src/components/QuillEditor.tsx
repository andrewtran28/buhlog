import React, { useRef, useCallback, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize";
import "react-quill/dist/quill.snow.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
Quill.register("modules/imageResize", ImageResize);

interface QuillEditorProps {
  token: string;
  content: string;
  setContent: (value: string) => void;
  uploadedImages: Set<string>;
  setUploadedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
  existingContent?: string;
  readOnly?: boolean;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  token,
  content,
  setContent,
  setUploadedImages,
  existingContent,
  readOnly,
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
      setUploadedImages(new Set(used));
    }
  }, [existingContent, setUploadedImages]);

  // useEffect(() => {
  //   const quill = quillRef.current?.getEditor();
  //   if (!quill) return;

  //   const handlePaste = async (e: ClipboardEvent) => {
  //     const clipboardData = e.clipboardData;
  //     if (!clipboardData) return;

  //     const htmlData = clipboardData.getData("text/html");
  //     if (!htmlData) return;

  //     const parser = new DOMParser();
  //     const doc = parser.parseFromString(htmlData, "text/html");
  //     const images = doc.querySelectorAll("img");

  //     const base64Images = Array.from(images).filter((img) => img.src?.startsWith("data:image/"));

  //     if (base64Images.length > 0) {
  //       e.preventDefault();

  //       for (const img of base64Images) {
  //         const src = img.getAttribute("src");
  //         if (!src) continue;

  //         try {
  //           const blob = await (await fetch(src)).blob();
  //           const formData = new FormData();
  //           formData.append("image", blob, "pasted-image.png");

  //           const res = await fetch(`${API_BASE_URL}/api/image`, {
  //             method: "POST",
  //             headers: {
  //               Authorization: `Bearer ${token}`,
  //             },
  //             body: formData,
  //           });

  //           const data = await res.json();
  //           if (res.ok && data.imageUrl) {
  //             addUploadedImage(data.imageUrl);
  //             const range = quill.getSelection(true);
  //             quill.insertEmbed(range.index, "image", data.imageUrl);
  //             quill.setSelection(range.index + 1);
  //           }
  //         } catch (err) {
  //           console.error("Failed to upload pasted image:", err);
  //         }
  //       }
  //     }
  //   };

  //   quill.root.addEventListener("paste", handlePaste as EventListener);
  //   return () => {
  //     quill.root.removeEventListener("paste", handlePaste as EventListener);
  //   };
  // }, [token]);

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
    clipboard: {
      matchVisual: false, // Disable automatic <p> wrapping
    },
    imageResize: {
      modules: ["Resize", "DisplaySize"],
    },
    history: {
      delay: 1000,
      maxStack: 500,
      userOnly: true,
    },
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
};

export default QuillEditor;
