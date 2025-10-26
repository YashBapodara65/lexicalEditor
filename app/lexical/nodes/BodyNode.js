"use client";
import { DecoratorNode } from "lexical";
import React, { useState, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import { DialogActions, DialogButtonsList } from "../ui/Dialog";

export class BodyNode extends DecoratorNode {
  __fields;

  static getType() {
    return "body-node";
  }

  static clone(node) {
    return new BodyNode([...node.__fields], node.__key);
  }

  constructor(fields = ["", ""], key) {
    super(key);
    this.__fields = fields;
  }

  // ✅ Export JSON with nested numbered list
  // exportJSON() {
  //   const listChildren = [];

  //   // Iterate every 2 fields (Title + Value)
  //   for (let i = 0; i < this.__fields.length; i += 2) {
  //     const title = this.__fields[i] || "";
  //     const value = this.__fields[i + 1] || "";

  //     listChildren.push({
  //       type: "listitem",
  //       version: 1,
  //       textFormat: 1,   // match your example
  //       value: i / 2 + 1, // 1, 2, 3...
  //       indent: 0,
  //       direction: null,
  //       format: "",
  //       children: [
  //         {
  //           type: "text",
  //           version: 1,
  //           detail: 0,
  //           format: 1, // title bold
  //           mode: "normal",
  //           style: "",
  //           text: title + ": ",
  //         },
  //         {
  //           type: "text",
  //           version: 1,
  //           detail: 0,
  //           format: 0, // value normal
  //           mode: "normal",
  //           style: "",
  //           text: value,
  //         },
  //       ],
  //     });
  //   }

  //   return {
  //     // type: "body-node",
  //     // version: 1,
  //     // fields: this.__fields,
  //     // nested: {
  //       type: "list",
  //       version: 1,
  //       textFormat: 1,
  //       listType: "number",
  //       start: 1,
  //       tag: "ol",
  //       indent: 0,
  //       direction: null,
  //       format: "",
  //       children: listChildren,
  //     // },
  //   };
  // }

exportJSON() {
  const listChildren = [];

  for (let i = 0; i < this.__fields.length; i += 2) {
    const title = this.__fields[i] || "";
    const value = this.__fields[i + 1] || "";

    listChildren.push({
      type: "listitem",
      version: 1,
      value: i / 2 + 1,
      direction: null,
      format: "",
      indent: 0,
      textFormat: 1,
      children: [
        {
          type: "text",
          version: 1,
          detail: 0,
          format: 1,
          mode: "normal",
          style: "",
          text: `${title}:`,
        },
        {
          type: "text",
          version: 1,
          detail: 0,
          format: 0,
          mode: "normal",
          style: "",
          text: ` ${value}`,
        },
      ],
    });
  }

  // ✅ This returns the full <list> node directly
  return {
    type: "list",
    version: 1,
    direction: null,
    format: "",
    indent: 0,
    textFormat: 1,
    listType: "number",
    start: 1,
    tag: "ol",
    children: listChildren,
  };
}


  static importJSON(json) {
    return new BodyNode(json.fields || ["", ""]);
  }

  createDOM() {
    return document.createElement("div");
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return <BodyNodeComponent fields={this.__fields} nodeKey={this.getKey()} />;
  }
}

export function $createTwoFieldNode(fields = ["", ""]) {
  return new BodyNode(fields);
}

export function $isBodyNode(node) {
  return node instanceof BodyNode;
}

// ---------------------------
// ✅ React Component UI
// ---------------------------
function BodyNodeComponent({ fields, nodeKey }) {
  const [editor] = useLexicalComposerContext();
  const [values, setValues] = useState(fields);
  const [open, setOpen] = useState(false);

  const updateNode = (newValues) => {
    editor.update(() => {
      const node = editor
        .getEditorState()
        .read(() => editor.getEditorState()._nodeMap.get(nodeKey));
      if (node) node.getWritable().__fields = newValues;
    });
  };

  const handleChange = (index, value) => {
    const updated = [...values];
    updated[index] = value;
    setValues(updated);
    updateNode(updated);
  };

  const addPair = () => {
    const updated = [...values, "", ""]; // ✅ add Title + Value together
    setValues(updated);
    updateNode(updated);
  };

  const removePair = (index) => {
    const updated = values.filter((_, i) => i < index || i >= index + 2); // remove pair
    setValues(updated);
    updateNode(updated);
  };

  const handleSubmit = () => {
    setOpen(false);
    updateNode(values);
  };

  return (
    <div className="p-3 border rounded bg-gray-50">
      <h3 className="font-semibold">📝 Title & Value Fields</h3>
      <Button onClick={() => setOpen(true)}>Edit Fields</Button>
      {open && (
        <Modal
          title="Edit Title & Value Fields"
          onClose={() => setOpen(false)}
          closeOnClickOutside={true}
        >
          <div className="space-y-2">
            {values.map((val, index) => {
              const isTitle = index % 2 === 0;
              return (
                <div key={index} className="flex items-center gap-2">
                  <TextInput
                    value={val}
                    placeholder={isTitle ? "Title" : "Value"}
                    onChange={(v) => handleChange(index, v)}
                  />
                  {!isTitle && (
                    <Button
                      onClick={() => removePair(index - 1)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      ✖
                    </Button>
                  )}
                </div>
              );
            })}

            <Button
              onClick={addPair}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              ➕ Add Title & Value Pair
            </Button>

            <DialogActions>
              <DialogButtonsList>
                <Button onClick={() => setOpen(false)} className="Cancel">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="Submit">
                  Submit
                </Button>
              </DialogButtonsList>
            </DialogActions>
          </div>
        </Modal>
      )}

      {/* Live preview */}
      <div className="mt-3 space-y-1">
        {values.map((val, idx) => (
          <p key={idx} className="text-sm">
            {idx % 2 === 0 ? <strong>{val}</strong> : val}
          </p>
        ))}
      </div>
    </div>
  );
}
