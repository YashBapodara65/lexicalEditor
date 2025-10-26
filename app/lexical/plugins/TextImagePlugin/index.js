"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $insertNodes } from "lexical";
import { useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import TextInput from "../../ui/TextInput";
import { DialogActions, DialogButtonsList } from "../../ui/Dialog";
import { $createTextImageNode } from "../../nodes/TextImageNode";

export default function TextImagePlugin() {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);

  const [fields, setFields] = useState([{ title: "", value: "" }]);
  const [imageUrl, setImageUrl] = useState("");

  const handleFieldChange = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const addField = () => setFields([...fields, { title: "", value: "" }]);
  const removeField = (i) => setFields(fields.filter((_, idx) => idx !== i));

const submitNode = () => {
  const validFields = fields.filter(f => f.title.trim() || f.value.trim());
  if (!validFields.length && !imageUrl.trim()) return;

  editor.update(() => {
    const root = $getRoot();

    // append only the new node
    const node = $createTextImageNode(validFields, imageUrl);
    root.append(node);
  });

  setFields([{ title: "", value: "" }]);
  setImageUrl("");
  setOpen(false);
};


  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Add Text & Image</Button>

      {open && (
        <Modal
          title="Add Title, Value & Image"
          onClose={() => setOpen(false)}
          closeOnClickOutside
        >
          <div className="DialogContent space-y-4">
            <h3 className="text-base font-semibold">Text Fields</h3>

            {fields.map((field, i) => (
              <div
                key={i}
                className="flex gap-3 items-end border p-3 rounded-md mb-2"
              >
                <div className="flex-1">
                  <TextInput
                    label={`Title ${i + 1}`}
                    placeholder="Enter title..."
                    value={field.title}
                    onChange={(val) => handleFieldChange(i, "title", val)}
                  />
                </div>
                <div className="flex-1">
                  <TextInput
                    label={`Value ${i + 1}`}
                    placeholder="Enter value..."
                    value={field.value}
                    onChange={(val) => handleFieldChange(i, "value", val)}
                  />
                </div>
                {fields.length > 1 && (
                  <Button
                    onClick={() => removeField(i)}
                    className="bg-red-500 text-white px-2 py-1"
                  >
                    -
                  </Button>
                )}
              </div>
            ))}

            <Button onClick={addField} className="mt-2">
              + Add Field
            </Button>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </h3>
              <TextInput
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={setImageUrl}
              />
            </div>

            <DialogActions>
              <DialogButtonsList>
                <Button onClick={() => setOpen(false)} className="Cancel">
                  Cancel
                </Button>
                <Button onClick={submitNode} className="Submit">
                  Submit
                </Button>
              </DialogButtonsList>
            </DialogActions>
          </div>
        </Modal>
      )}
    </>
  );
}
