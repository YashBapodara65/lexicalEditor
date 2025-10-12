"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DecoratorNode } from "lexical";
import Image from "next/image";
import React, { useState } from "react";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import Button from "../ui/Button";
import { DialogActions, DialogButtonsList } from "../ui/Dialog";

// -------------------- Node Definition --------------------
export class TextImageNode extends DecoratorNode {
  __fields;
  __image;

  static getType() {
    return "text-image-node";
  }

  static clone(node) {
    return new TextImageNode([...node.__fields], node.__image, node.__key);
  }

  constructor(fields = [], image = "", key) {
    super(key);
    this.__fields = fields;
    this.__image = image;
  }

  exportJSON() {
    return {
      type: "text-image-node",
      version: 1,
      fields: this.__fields,
      image: this.__image,
    };
  }

  static importJSON(serializedNode) {
    return new TextImageNode(
      serializedNode.fields || [],
      serializedNode.image || ""
    );
  }

  createDOM() {
    const div = document.createElement("div");
    div.style.width = "100%";
    return div;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <TextImageComponent
        fields={this.__fields}
        image={this.__image}
        node={this}
      />
    );
  }
}

// -------------------- Helpers --------------------
export function $createTextImageNode(fields = [], image = "") {
  return new TextImageNode(fields, image);
}

export function $isTextImageNode(node) {
  return node instanceof TextImageNode;
}

// -------------------- React Component --------------------
function TextImageComponent({ fields, image, node }) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const [localFields, setLocalFields] = useState(
    Array.isArray(fields) ? [...fields] : []
  );
  const [localImage, setLocalImage] = useState(image);

  const handleFieldChange = (index, key, value) => {
    const updated = [...localFields];
    updated[index][key] = value;
    setLocalFields(updated);
  };

  const addField = () =>
    setLocalFields([...localFields, { title: "", value: "" }]);
  const removeField = (i) =>
    setLocalFields(localFields.filter((_, idx) => idx !== i));

  const submitEdit = () => {
    editor.update(() => {
      const writableNode = node.getWritable();

      writableNode.__fields = localFields;
      writableNode.__image = localImage;
    });
    setOpen(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        border: "1px solid #ccc",
        padding: "12px",
        margin: "8px 0",
        gap: "12px",
        width: "100%",
        borderRadius: "8px",
        background: "#f9fafb",
        boxSizing: "border-box",
      }}
      contentEditable={false}
    >
      {/* Fields Section */}
      <div style={{ flex: 1 }}>
        {Array.isArray(fields) &&
          fields.map((field, i) => (
            <p key={i} style={{ margin: "4px 0", color: "#333" }}>
              <strong>{field.title}:</strong> {field.value}
            </p>
          ))}
      </div>

      {/* Optional Image */}
      {image && (
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          <Image
            src={image}
            alt="text-image"
            width={150}
            height={100}
            style={{ borderRadius: 6, objectFit: "contain" }}
            unoptimized
          />
        </div>
      )}

      {/* Edit Button */}
      <div style={{ marginLeft: "12px" }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "4px 8px",
            background: "#007bff",
            color: "#fff",
            borderRadius: 4,
          }}
        >
          Edit
        </button>
      </div>

      {/* Modal */}
      {open && (
        <Modal
          title="Edit Text & Image"
          onClose={() => setOpen(false)}
          closeOnClickOutside
        >
          <div className="DialogContent space-y-4">
            {localFields.map((field, i) => (
              <div
                key={i}
                className="flex gap-3 items-end border p-3 rounded-md mb-2"
              >
                <div className="flex-1">
                  <TextInput
                    label={`Title ${i + 1}`}
                    value={field.title}
                    onChange={(val) => handleFieldChange(i, "title", val)}
                  />
                </div>
                <div className="flex-1">
                  <TextInput
                    label={`Value ${i + 1}`}
                    value={field.value}
                    onChange={(val) => handleFieldChange(i, "value", val)}
                  />
                </div>
                {localFields.length > 1 && (
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
              <TextInput
                placeholder="Image URL"
                value={localImage}
                onChange={setLocalImage}
              />
            </div>

            <DialogActions>
              <DialogButtonsList>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submitEdit}>Save</Button>
              </DialogButtonsList>
            </DialogActions>
          </div>
        </Modal>
      )}
    </div>
  );
}
