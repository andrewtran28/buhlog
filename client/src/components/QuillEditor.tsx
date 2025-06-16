import React, { useImperativeHandle, forwardRef, useRef, useEffect, useCallback } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize";
import "react-quill/dist/quill.snow.css";

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

function getQuillIndexFromRange(range: Range, quill: Quill, root: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;

  const tempSelection = selection.getRangeAt(0);
  selection.removeAllRanges();
  selection.addRange(range);

  const index = quill.getSelection()?.index || 0;

  selection.removeAllRanges();
  selection.addRange(tempSelection);

  return index;
}

const QuillEditor = forwardRef<QuillEditorHandle, QuillEditorProps>(
  ({ token, content, setContent, existingContent, readOnly }, ref) => {
    const quillRef = useRef<ReactQuill>(null);

    useImperativeHandle(ref, () => ({
      getHTML: () => {
        return quillRef.current?.editor?.root.innerHTML || "";
      },
    }));

    useEffect(() => {
      const quill = quillRef.current?.editor;
      if (!quill) return;

      const editorRoot = quill.root;

      const handlePaste = async (e: ClipboardEvent) => {
        if (!e.clipboardData) return;

        const items = e.clipboardData.items;
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            e.preventDefault();

            const file = item.getAsFile();
            if (!file) continue;

            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              const range = quill.getSelection(true);
              quill.insertEmbed(range?.index || 0, "image", base64);
              quill.setSelection((range?.index || 0) + 1);
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      };

      editorRoot.addEventListener("paste", handlePaste as EventListener);

      const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (!e.dataTransfer) return;

        const quill = quillRef.current?.editor;
        if (!quill) return;

        const files = Array.from(e.dataTransfer.files);
        for (const file of files) {
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              const dropPosition = document.caretRangeFromPoint
                ? document.caretRangeFromPoint(e.clientX, e.clientY)
                : null;
              const index = dropPosition
                ? getQuillIndexFromRange(dropPosition, quill, quill.root)
                : quill.getSelection()?.index || 0;

              quill.insertEmbed(index, "image", base64);
              quill.setSelection(index + 1);
            };
            reader.readAsDataURL(file);
          }
        }
      };

      const handleDragOver = (e: DragEvent) => {
        e.preventDefault(); // Needed to allow drop
      };

      editorRoot.addEventListener("drop", handleDrop as EventListener);
      editorRoot.addEventListener("dragover", handleDragOver as EventListener);

      return () => {
        editorRoot.removeEventListener("paste", handlePaste as EventListener);
        editorRoot.removeEventListener("drop", handleDrop as EventListener);
        editorRoot.removeEventListener("dragover", handleDragOver as EventListener);
      };
    }, []);

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
