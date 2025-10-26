"use client";
import React, { useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getRoot, $getSelection } from "lexical";
import { $createListItemNode, $createListNode } from "@lexical/list";
import useModal from "../../hooks/useModal";
import Button from "../../ui/Button";
import TextInput from "../../ui/TextInput";
import { DialogActions } from "../../ui/Dialog";

export default function BodyPlugin() {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useModal();

  const openDialog = useCallback(() => {
    showModal("Add Title & Value", (onClose) => (
      <InsertBodyDialog
        onSubmit={(fields) => {
          editor.update(() => {
            const root = $getRoot();

            // Remove any empty paragraph at the start
            root.getChildren().forEach((node) => {
              if (
                node.getType() === "paragraph" &&
                node.getTextContent() === ""
              ) {
                node.remove();
              }
            });

            // Create a new ordered list
            const list = $createListNode("number");

            // Append each dynamic field pair
            fields.forEach(({ title, value }, idx) => {
              const item = $createListItemNode();
              item.setValue(idx + 1); // proper numbering
              item.append($createTextNode(`${title}:`).setFormat(1)); // bold title
              item.append($createTextNode(` ${value}`)); // normal value
              list.append(item);
            });

            // Append the new list to root
            root.append(list);

            // Move cursor to the end of the new list
            const selection = $getSelection();
            if (selection) {
              list.selectEnd(); // <-- important
            }
          });

          onClose();
        }}
        onClose={onClose}
      />
    ));
  }, [editor, showModal]);

  return (
    <>
      <Button onClick={openDialog}>Add Title & Value</Button>
      {modal}
    </>
  );
}

function InsertBodyDialog({ onSubmit, onClose }) {
  const [fields, setFields] = React.useState([{ title: "", value: "" }]);

  const addField = () => setFields([...fields, { title: "", value: "" }]);
  const updateField = (i, key, val) => {
    const next = [...fields];
    next[i][key] = val;
    setFields(next);
  };

  return (
    <div className="p-4 w-full max-w-md">
      <h3 className="font-semibold mb-2">Add Title & Value Pairs</h3>
      {fields.map((f, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <TextInput
            placeholder="Title"
            value={f.title}
            onChange={(v) => updateField(i, "title", v)}
          />
          <TextInput
            placeholder="Value"
            value={f.value}
            onChange={(v) => updateField(i, "value", v)}
          />
        </div>
      ))}
      <Button onClick={addField}>+ Add Another</Button>

      <DialogActions>
        <Button
          onClick={() => onSubmit(fields)}
          disabled={fields.some((f) => !f.title || !f.value)}
        >
          Confirm
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </div>
  );
}
