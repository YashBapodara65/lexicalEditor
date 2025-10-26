import React, { useCallback, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes } from "lexical";
import { DynamicNode } from "../../nodes/DynamicNode";
import Button from "../../ui/Button";
import TextInput from "../../ui/TextInput";
import FileInput from "../../ui/FileInput";
import useModal from "../../hooks/useModal";
import { DialogActions } from "../../ui/Dialog";

// -------------------- CompanyPlugin --------------------
export default function CompanyPlugin() {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useModal();

  // Open Add/Edit dialog
  const openHeaderDialog = useCallback(
    (node = null) => {
      showModal(node ? "Edit Header" : "Add Header", (onClose) => (
        <InsertHeaderDialog
          node={node}
          onSubmit={({ fields, logoData }) => {
            editor.update(() => {
              if (node) {
                node.updateFields(fields);
                node.updateExtra(
                  logoData ? { logo: logoData, onEdit: openHeaderDialog } : {}
                );
              } else {
                const dynamicNode = new DynamicNode({
                  fields,
                  extra: logoData
                    ? { logo: logoData, onEdit: openHeaderDialog }
                    : {},
                  Component: DynamicComponent,
                });
                $insertNodes([dynamicNode]);
              }
            });
            onClose(); // close modal
          }}
          onClose={onClose}
        />
      ));
    },
    [editor, showModal]
  );

  return (
    <>
      <Button onClick={() => openHeaderDialog()}>Add Header</Button>
      {modal}
    </>
  );
}

// -------------------- DynamicComponent (preview) --------------------
function DynamicComponent({ node, onEdit }) {
  return (
    <div
      onClick={() => onEdit?.(node)}
      className="border p-2 rounded cursor-pointer"
    >
      {node.fields.map((f) => (
        <p key={f.id}>
          {f.title}: {f.value}
        </p>
      ))}
      {node.extra?.logo && node.extra.logo.type === "image" && (
        <Image
          src={node.extra.logo.value} 
          alt="Logo"
          width={150} 
          height={100}
          className="object-contain mt-2"
        />
      )}
      {node.extra?.logo && node.extra.logo.type === "url" && (
        <p>Logo URL: {node.extra.logo.value}</p>
      )}
    </div>
  );
}

// -------------------- InsertHeaderDialog --------------------
function InsertHeaderDialog({ node, onSubmit, onClose }) {
  const [fields, setFields] = useState(
    node?.fields
      ? node.fields.map((f) => ({ ...f, id: f.id || crypto.randomUUID() }))
      : [{ title: "", value: "", id: crypto.randomUUID() }]
  );
  const [logoData, setLogoData] = useState(node?.extra?.logo || null);
  const [mode, setMode] = useState(null);

  const addField = () =>
    setFields([...fields, { title: "", value: "", id: crypto.randomUUID() }]);

  const updateField = (idx, key, val) => {
    const newFields = [...fields];
    newFields[idx][key] = val;
    setFields(newFields);
  };

  const removeField = (idx) => setFields(fields.filter((_, i) => i !== idx));

  const loadImage = (files) => {
    if (!files?.length) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogoData({
          value: reader.result,
          type: "image",
          id: crypto.randomUUID(),
        });
      }
    };
    reader.readAsDataURL(files[0]);
  };

  const isDisabled =
    fields.length === 0 || fields.some((f) => !f.title || !f.value);

  return (
    <div className="p-4 w-full max-w-md max-h-[70vh] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-2">Header Details</h3>

      {fields.map((field, idx) => (
        <div key={field.id} className="flex gap-2 mb-2">
          <TextInput
            placeholder="Title"
            value={field.title}
            onChange={(val) => updateField(idx, "title", val)}
            className="flex-1"
          />
          <TextInput
            placeholder="Value"
            value={field.value}
            onChange={(val) => updateField(idx, "value", val)}
            className="flex-1"
          />
          <Button onClick={() => removeField(idx)}>-</Button>
        </div>
      ))}

      <div className="flex gap-2 mb-4">
        <Button onClick={addField}>Add Field</Button>
      </div>

      {/* Logo section */}
      {!mode && !logoData?.editable && (
        <div className="mb-4">
          <Button onClick={() => setMode("url")}>Logo URL</Button>
          <Button onClick={() => setMode("file")}>Upload Logo</Button>
        </div>
      )}

      {mode === "url" && (
        <TextInput
          placeholder="https://example.com/logo.png"
          value={logoData?.value || ""}
          onChange={(val) =>
            setLogoData({ value: val, type: "url", id: crypto.randomUUID() })
          }
        />
      )}

      {mode === "file" && <FileInput onChange={loadImage} accept="image/*" />}

      {logoData && (
        <div className="mt-2">
          {logoData.type === "image" ? (
            <Image
              src={logoData.value}
              alt="Logo"
              width={150}
              height={50}
              className="object-contain"
            />
          ) : (
            <p>Logo URL: {logoData.value}</p>
          )}
          <Button onClick={() => setLogoData(null)} className="ml-2">
            Remove Logo
          </Button>
        </div>
      )}

      <DialogActions>
        <Button
          disabled={isDisabled}
          onClick={() => onSubmit({ fields, logoData })}
        >
          Confirm
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </div>
  );
}
