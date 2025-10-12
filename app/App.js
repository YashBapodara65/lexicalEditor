"use client";

import "./style.css";
import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LexicalCollaboration } from "@lexical/react/LexicalCollaborationContext";
import { $getRoot, $getSelection, $nodesOfType, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_HIGH, DELETE_CHARACTER_COMMAND, KEY_BACKSPACE_COMMAND, TextNode } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { FlashMessageContext } from "./context/FlashMessageContext";
import { SettingsContext, useSettings } from "./context/SettingsContext";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import { ToolbarContext } from "./context/ToolbarContext";
import { TableContext } from "./plugins/TablePlugin";

import PlaygroundNodes from "./nodes/PlaygroundNodes";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";
import DocsPlugin from "./plugins/DocsPlugin";
import PasteLogPlugin from "./plugins/PasteLogPlugin";
import TestRecorderPlugin from "./plugins/TestRecorderPlugin";
import TypingPerfPlugin from "./plugins/TypingPerfPlugin";
import logo from "./images/logo.svg";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { DivNode } from "./nodes/DivNode";
import Image from "next/image";
import {
  $createReadOnlyTextNode,
  $isReadOnlyTextNode,
  ReadOnlyTextNode,
} from "./nodes/ReadOnlyTextNode";
import { getSelectedNode } from "./utils/getSelectedNode";
import { CustomTableCellNode } from "./nodes/TableBorderCellNode";
import { INSERT_TABLE_COMMAND, TableCellNode, TableNode } from "@lexical/table";

// Dynamic client-only import
const ClientEditor = dynamic(() => import("./Editor"), { ssr: false });

// Example PRELOADED JSON
const PRELOADED_JSON = {
  "root": {
    "children": [
      {
        "children": [],
        "direction": null,
        "format": "",
        "indent": 0,
        "type": "paragraph",
        "version": 1,
        "textFormat": 0,
        "textStyle": ""
      },
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": "#d0021b",
                "colSpan": 1,
                "headerState": 3,
                "rowSpan": 1,
                "width": 1,
                "id": "647d7203-7408-4a0c-8eec-aca4b4580009",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 1,
                "rowSpan": 1,
                "width": 1,
                "id": "70dfbdc0-0235-4a89-b413-3e11113961f3",
                "borders": {
                  "top": false,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 1,
                "rowSpan": 1,
                "width": 1,
                "id": "fc85d4d7-d203-4905-8d33-6a117cdee141",
                "borders": {
                  "top": false,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 2,
                "headerState": 1,
                "rowSpan": 5,
                "width": 5,
                "id": "af5caa52-bee2-40d5-ba42-a875cbaf3f34",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              }
            ],
            "direction": null,
            "format": "",
            "indent": 0,
            "type": "tablerow",
            "version": 1,
            "height": 42
          },
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 2,
                "rowSpan": 1,
                "width": 1,
                "id": "b7cf6bbb-9716-4702-8cac-aed36aac445c",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "width": 1,
                "id": "9e944d82-b5b5-4166-a1b2-c291d366468a",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "width": 1,
                "id": "b7b27c44-b6ac-4fe8-8332-718f96afdf94",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              }
            ],
            "direction": null,
            "format": "",
            "indent": 0,
            "type": "tablerow",
            "version": 1
          },
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 2,
                "rowSpan": 1,
                "width": 1,
                "id": "2607216f-f439-41b2-b11d-ee0467e98d7c",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "width": 1,
                "id": "ba82d7e0-6d7c-4d0d-b24e-080c0502be7a",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "width": 1,
                "id": "c1b010fb-6887-4cee-a5e9-8311f1c54abe",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              }
            ],
            "direction": null,
            "format": "",
            "indent": 0,
            "type": "tablerow",
            "version": 1
          },
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 2,
                "rowSpan": 1,
                "width": 1,
                "id": "ae3b7d63-e4b0-48bc-be28-df6a66747cbe",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "width": 1,
                "id": "615887f0-6fcd-42e3-a7a2-8d9fd9507074",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "width": 1,
                "id": "d5abcb9d-4322-4ca9-8852-f3bc766cee97",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              }
            ],
            "direction": null,
            "format": "",
            "indent": 0,
            "type": "tablerow",
            "version": 1
          },
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 2,
                "rowSpan": 1,
                "width": 1,
                "id": "6e30e911-ec28-446e-9721-228cae2b52c7",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "width": 1,
                "id": "d3019caf-ef16-494a-aeef-56435dfb15a8",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": ""
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "custom-tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "width": 1,
                "id": "bd09adfb-d6f1-4617-b487-435402a3a1b0",
                "borders": {
                  "top": true,
                  "right": true,
                  "bottom": true,
                  "left": true
                }
              }
            ],
            "direction": null,
            "format": "",
            "indent": 0,
            "type": "tablerow",
            "version": 1
          }
        ],
        "direction": null,
        "format": "",
        "indent": 0,
        "type": "table",
        "version": 1,
        "colWidths": [
          201.8182373046875,
          292.72723388671875,
          313.81817626953125,
          92,
          92
        ]
      },
      {
        "children": [],
        "direction": null,
        "format": "",
        "indent": 0,
        "type": "paragraph",
        "version": 1,
        "textFormat": 0,
        "textStyle": ""
      }
    ],
    "direction": null,
    "format": "",
    "indent": 0,
    "type": "root",
    "version": 1
  }
};

// Editor wrapper
export function ClientEditorWrapper({ preloadedJSON }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 1️⃣ Load preloaded JSON
    if (preloadedJSON) {
      const editorState = editor.parseEditorState(JSON.stringify(preloadedJSON));
      editor.setEditorState(editorState);
    }

    // 2️⃣ Convert all existing TextNodes to ReadOnlyTextNode
    editor.update(() => {
      const root = $getRoot();
      root.getAllTextNodes().forEach((node) => {
        if (!$isReadOnlyTextNode(node)) {
          const text = node.getTextContent();
          const format = node.getFormat();
          const style = node.getStyle();
          const readOnlyNode = $createReadOnlyTextNode(text);
          readOnlyNode.setFormat(format);
          readOnlyNode.setStyle(style);
          node.replace(readOnlyNode);
        }
      });
    });

// Run when a new table is inserted
const unregisterInsertTable = editor.registerCommand(
  INSERT_TABLE_COMMAND,
  (payload) => {
    // Wait for table to be inserted, then replace cells
    setTimeout(() => {
      editor.update(() => {
        const cells = $nodesOfType(TableCellNode);
        cells.forEach((cell) => {
          if (cell instanceof CustomTableCellNode) return;

          const newCell = new CustomTableCellNode(cell.__headerState);
          newCell.append(...cell.getChildren());
          cell.replace(newCell);
        });
      });
    }, 0);
    return false; // let normal insert logic continue
  },
  COMMAND_PRIORITY_EDITOR
);    
    
    // 3️⃣ Live transform any new TextNodes typed by user
    const unregisterTransform = editor.registerNodeTransform(TextNode, (node) => {
      if (!$isReadOnlyTextNode(node)) {
        const text = node.getTextContent();
        const format = node.getFormat();
        const style = node.getStyle();
        const readOnlyNode = $createReadOnlyTextNode(text);
        readOnlyNode.setFormat(format);
        readOnlyNode.setStyle(style);
        node.replace(readOnlyNode);
      }
    });

    return () => {
      unregisterTransform();
      unregisterInsertTable();
    };
  }, [editor, preloadedJSON]);


  useEffect(() => {
    const removeDeleteHandler = editor.registerCommand(
      DELETE_CHARACTER_COMMAND,
      (payload) => {
        const selection = $getSelection();
        if (!selection) return false;
        const node = getSelectedNode(selection);
        if (node && $isReadOnlyTextNode(node) && node.isReadOnly()) {
          console.warn("🚫 Delete blocked: node is readonly", node.__id);
          return true; // block delete
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    const removeBackspaceHandler = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (payload) => {
        const selection = $getSelection();
        if (!selection) return false;
        const node = getSelectedNode(selection);
        if (node && $isReadOnlyTextNode(node) && node.isReadOnly()) {
          console.warn("🚫 Backspace blocked: node is readonly", node.__id);
          return true; // block backspace
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      removeDeleteHandler();
      removeBackspaceHandler();
    };
  }, [editor]);

  return <ClientEditor/>

}

// Export button
export function ExportButton() {
  const [editor] = useLexicalComposerContext();
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    // Listen for all editor updates
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        setJsonData(editorState.toJSON());
      });
    });

    // Initialize JSON immediately
    editor.update(() => {
      setJsonData(editor.getEditorState().toJSON());
    });

    return () => unregister();
  }, [editor]);

  const handleDownloadJSON = () => {
    if (!jsonData) return;
    const dataStr = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "editor-content.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <h4>Live JSON Output</h4>
      <pre
        style={{
          maxHeight: "300px",
          overflow: "auto",
          background: "#1e1e1e",
          color: "#fff",
          padding: "10px",
        }}
      >
        {jsonData ? JSON.stringify(jsonData, null, 2) : "Loading..."}
      </pre>
      <button onClick={handleDownloadJSON}>Export JSON</button>
    </div>
  );
}

// Main App
function App() {
  const { settings } = useSettings();
  const { isCollab, emptyEditor, measureTypingPerf } = settings;

  const appExtension = useMemo(
    () => ({
      name: "@lexical/playground",
      namespace: "Playground",
      nodes: [...PlaygroundNodes, ReadOnlyTextNode, CustomTableCellNode],
      theme: PlaygroundEditorTheme,
      onError: (error) => {
        console.error("Lexical Editor Error:", error);
      },
    }),
    []
  );

  return (
    <LexicalCollaboration>
      <LexicalComposer initialConfig={appExtension}>
        <SharedHistoryContext>
          <TableContext>
            <ToolbarContext>
              <header className="text-editor-header">
                <a href="https://lexical.dev" target="_blank" rel="noreferrer">
                  <Image
                    src={logo}
                    alt="Lexical Logo"
                    width={100} // specify width
                    height={100} // specify height
                  />
                </a>
              </header>

              <div className="editor-shell">
                <ClientEditorWrapper preloadedJSON={PRELOADED_JSON} />
                <ExportButton />
              </div>
              {isCollab && <DocsPlugin />}
              {isCollab && <PasteLogPlugin />}
              {isCollab && <TestRecorderPlugin />}
              {measureTypingPerf && <TypingPerfPlugin />}
            </ToolbarContext>
          </TableContext>
        </SharedHistoryContext>
      </LexicalComposer>
    </LexicalCollaboration>
  );
}

// Final export
export default function PlaygroundApp() {
  return (
    <SettingsContext>
      <FlashMessageContext>
        <App />
      </FlashMessageContext>
    </SettingsContext>
  );
}
