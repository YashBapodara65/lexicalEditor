"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $insertNodes } from "lexical";
import Button from "../../ui/Button";
import useModal from "../../hooks/useModal";
import TextInput from "../../ui/TextInput";
import { DialogActions } from "../../ui/Dialog";
import SwitchToggle from "@/app/_components/reusable/SwitchToggle";
import { FooterNode } from "../../nodes/FooterNode";

// ---------------- Footer Plugin ----------------
export default function FooterPlugin() {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useModal();

  const openFooterDialog = useCallback(
    (existingParagraphs = null) => {
      const initialTopRows = existingParagraphs?.topRows || [
        [{ text: "", format: 0, style: "" }],
      ];
      const initialBottomRows = existingParagraphs?.bottomRows || [
        { title: "", value: "", formatTitle: 0, formatValue: 0 },
      ];
      const initialPageNo = existingParagraphs?.pageNo || false;

      showModal("Edit Footer", (onClose) => (
        <FooterDialog
          initialTopRows={initialTopRows}
          initialBottomRows={initialBottomRows}
          initialPageNo={initialPageNo}
          onClose={onClose}
          onSubmit={(updatedTopRows, updatedBottomRows, pageNo) => {
            // editor.update(() => {
            //   const nodesToInsert = [];

            //   // Top rows
            //   updatedTopRows.forEach((row) => {
            //     const para = $createParagraphNode();
            //     para.__fieldType = "top"; // attach type
            //     para.__className = "flex justify-between"; // spread child nodes
            //     row.forEach((child) => {
            //       para.append(
            //         $createTextNode(child.text || "")
            //           .setFormat(child.format || 0)
            //           .setStyle(child.style || "")
            //       );
            //     });
            //     nodesToInsert.push(para);
            //   });

            //   // Bottom rows
            //   updatedBottomRows.forEach((row) => {
            //     const para = $createParagraphNode();
            //     para.__fieldType = "bottom";
            //     para.append(
            //       $createTextNode(row.title || "").setFormat(
            //         row.formatTitle || 0
            //       )
            //     );
            //     para.append(
            //       $createTextNode(`: ${row.value || ""}`).setFormat(
            //         row.formatValue || 0
            //       )
            //     );
            //     nodesToInsert.push(para);
            //   });

            //   // Page number
            //   if (pageNo) {
            //     const para = $createParagraphNode();
            //     para.__fieldType = "pageNo";
            //     para.append($createTextNode("Page 1 of 1").setFormat(2));
            //     nodesToInsert.push(para);
            //   }

            //   $insertNodes(nodesToInsert);
            // });
            editor.update(() => {
              const fields = [];

              // Top rows
              updatedTopRows.forEach((row) => {
                fields.push({
                  type: "top",
                  children: row.map((child) => ({
                    text: child.text || "",
                    format: child.format || 0,
                    style: child.style || {},
                  })),
                });
              });

              // Bottom rows (combine title and value into children)
              updatedBottomRows.forEach((row) => {
                fields.push({
                  type: "bottom",
                  children: [
                    {
                      text: row.title || "",
                      format: row.formatTitle || 0,
                      style: { fontWeight: "600" }, // optional styling
                    },
                    {
                      text: row.value || "",
                      format: row.formatValue || 0,
                      style: {},
                    },
                  ],
                });
              });

              // Page number
              if (pageNo) {
                fields.push({
                  type: "top",
                  children: [{ text: "Page 1 of 1", format: 2, style: {} }],
                });
              }

              // Insert a single FooterNode
              const footerNode = new FooterNode(fields);
              $insertNodes([footerNode]);
            });

            onClose();
          }}
        />
      ));
    },
    [editor, showModal]
  );

  useEffect(() => {
    const handler = (e) => openFooterDialog(e.detail);
    window.addEventListener("open-footer-edit", handler);
    return () => window.removeEventListener("open-footer-edit", handler);
  }, [openFooterDialog]);

  return (
    <>
      <Button onClick={() => openFooterDialog()}>Add Footer</Button>
      {modal}
    </>
  );
}

// ---------------- Footer Dialog ----------------
function FooterDialog({
  initialTopRows,
  initialBottomRows,
  initialPageNo,
  onSubmit,
  onClose,
}) {
  const [topRows, setTopRows] = useState(initialTopRows);
  const [bottomRows, setBottomRows] = useState(initialBottomRows);
  const [pageNo, setPageNo] = useState(initialPageNo);

  const updateTopRow = (rowIdx, childIdx, key, value) => {
    setTopRows((prev) => {
      const copy = [...prev];
      copy[rowIdx][childIdx][key] = value;
      return copy;
    });
  };
  const addTopRow = () =>
    setTopRows((prev) => [...prev, [{ text: "", format: 0, style: "" }]]);
  const removeTopRow = (idx) =>
    setTopRows((prev) => prev.filter((_, i) => i !== idx));

  const updateBottomRow = (idx, key, value) => {
    setBottomRows((prev) => {
      const copy = [...prev];
      copy[idx][key] = value;
      return copy;
    });
  };
  const addBottomRow = () =>
    setBottomRows((prev) => [
      ...prev,
      { title: "", value: "", formatTitle: 0, formatValue: 0 },
    ]);
  const removeBottomRow = (idx) =>
    setBottomRows((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="p-4 w-full max-h-[70vh] overflow-y-auto max-w-md">
      {/* Page No Toggle */}
      <div className="mb-4 flex justify-start">
        <SwitchToggle
          label="Page No Option"
          checked={pageNo}
          onChange={setPageNo}
        />
      </div>

      {/* Top Rows */}
      <h3 className="text-lg font-semibold mb-2">Top Rows</h3>
      {topRows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-between gap-4 mb-2 items-end">
          {row.map((child, childIdx) => (
            <div key={childIdx} className="flex flex-col flex-1 min-w-[120px]">
              <label className="text-gray-700 font-medium mb-1">Text</label>
              <TextInput
                value={child.text}
                onChange={(val) => updateTopRow(rowIdx, childIdx, "text", val)}
              />
            </div>
          ))}
          {topRows.length > 1 && (
            <Button onClick={() => removeTopRow(rowIdx)}>-</Button>
          )}
        </div>
      ))}
      <Button onClick={addTopRow}>+ Add Top Row</Button>

      {/* Bottom Rows */}
      <h3 className="text-lg font-semibold mb-2 mt-5">Bottom Rows</h3>
      {bottomRows.map((row, idx) => (
        <div key={idx} className="flex gap-4 mb-2 items-end">
          <div className="flex flex-col flex-1 min-w-[120px]">
            <label className="text-gray-700 font-medium mb-1">Title</label>
            <TextInput
              value={row.title}
              onChange={(val) => updateBottomRow(idx, "title", val)}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-[120px]">
            <label className="text-gray-700 font-medium mb-1">Value</label>
            <TextInput
              value={row.value}
              onChange={(val) => updateBottomRow(idx, "value", val)}
            />
          </div>
          {bottomRows.length > 1 && (
            <Button onClick={() => removeBottomRow(idx)}>-</Button>
          )}
        </div>
      ))}
      <Button onClick={addBottomRow}>+ Add Bottom Row</Button>

      {/* Actions */}
      <DialogActions>
        <div className="flex gap-4 mt-4">
          <Button onClick={() => onSubmit(topRows, bottomRows, pageNo)}>
            Confirm
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </DialogActions>
    </div>
  );
}

export function FooterComponent({ fields }) {
  return (
    <div className="footer-node">
      <div className="flex justify-between">
        {fields.map((field, rowIdx) => {
          // Top rows (including pageNo now)
          if (field.type === "top") {
            return (
              <div
                key={rowIdx}
                className="flex items-center justify-between gap-2 flex-wrap"
              >
                {field.children?.map((child, i) => (
                  <span
                    key={i}
                    style={{ ...child.style }}
                    className={`text-red-500 font-medium ${field.type === ""}`}
                  >
                    {child.text}
                  </span>
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
      <hr/>
      <div className="flex justify-between">
        {fields.map((field, rowIdx) => {
          // Top rows (including pageNo now)
          if (field.type === "bottom") {
            return (
              <div
                key={rowIdx}
                className="flex items-center justify-between mb-2 gap-2 flex-wrap"
              >
                {field.children?.map((child, i) => (
                  <span
                    key={i}
                    style={{ ...child.style }}
                    className="text-gray-800 font-medium"
                  >
                    {child.text}
                  </span>
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
