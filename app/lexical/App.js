"use client";

import "./style.css";
import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LexicalCollaboration } from "@lexical/react/LexicalCollaborationContext";
import {
  $getRoot,
  $getSelection,
  $nodesOfType,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  DELETE_CHARACTER_COMMAND,
  KEY_BACKSPACE_COMMAND,
  TextNode,
} from "lexical";
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
} from "./nodes/ReadOnlyTextNode";
import { getSelectedNode } from "./utils/getSelectedNode";
import { TableBorderCellNode } from "./nodes/TableBorderCellNode";
import { INSERT_TABLE_COMMAND, TableCellNode, TableNode } from "@lexical/table";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import PDFDownloadPlugin from "./plugins/PDFDownloadPlugin";

// Dynamic client-only import
const ClientEditor = dynamic(() => import("./Editor"), { ssr: false });

// Editor wrapper
// Updated ClientEditorWrapper
export function ClientEditorWrapper({ preloadedJSON }) {
  const [editor] = useLexicalComposerContext();
  const [jsonData, setJsonData] = useState(preloadedJSON || null);

  useEffect(() => {
    // Load preloaded JSON if available
    if (preloadedJSON) {
      const editorState = editor.parseEditorState(
        JSON.stringify(preloadedJSON)
      );
      editor.setEditorState(editorState);
    }

    // Convert all existing TextNodes to ReadOnlyTextNode
    editor.update(() => {
      const editorState = editor.parseEditorState(
        JSON.stringify(preloadedJSON)
      );
      editor.setEditorState(editorState);
      // Convert TextNodes to ReadOnlyTextNode safely
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

    // Replace new tables with TableBorderCellNode
    const unregisterInsertTable = editor.registerCommand(
      INSERT_TABLE_COMMAND,
      (payload) => {
        setTimeout(() => {
          editor.update(() => {
            const cells = $nodesOfType(TableCellNode);
            cells.forEach((cell) => {
              if (cell instanceof TableBorderCellNode) return;
              const newCell = new TableBorderCellNode(cell.__headerState);
              newCell.append(...cell.getChildren());
              cell.replace(newCell);
            });
          });
        }, 0);
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    );

    // Transform newly typed TextNodes into ReadOnlyTextNode
    const unregisterTransform = editor.registerNodeTransform(
      TextNode,
      (node) => {
        if (!$isReadOnlyTextNode(node)) {
          const text = node.getTextContent();
          const format = node.getFormat();
          const style = node.getStyle();
          const readOnlyNode = $createReadOnlyTextNode(text);
          readOnlyNode.setFormat(format);
          readOnlyNode.setStyle(style);
          node.replace(readOnlyNode);
        }
      }
    );

    return () => {
      unregisterInsertTable();
      unregisterTransform();
    };
  }, [editor, preloadedJSON]);

  // Block delete/backspace for read-only nodes
  useEffect(() => {
    const removeDeleteHandler = editor.registerCommand(
      DELETE_CHARACTER_COMMAND,
      (payload) => {
        const selection = $getSelection();
        if (!selection) return false;
        const node = getSelectedNode(selection);
        if (node && $isReadOnlyTextNode(node) && node.isReadOnly()) {
          return true;
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
          return true;
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

  return (
    <>
      {/* Editor */}
      <ClientEditor />

      {/* Live JSON using OnChangePlugin */}
      <OnChangePlugin
        onChange={(editorState) => {
          editorState.read(() => {
            setJsonData(editorState.toJSON());
          });
        }}
      />

      {/* Export Button */}
      <ExportButton jsonData={jsonData} />
    </>
  );
}

// Export button
export function ExportButton({ jsonData }) {
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
function App({ preloadedJSON }) {
  const { settings } = useSettings();
  const { isCollab, emptyEditor, measureTypingPerf } = settings;

  const appExtension = useMemo(
    () => ({
      name: "@lexical/playground",
      namespace: "Playground",
      nodes: [...PlaygroundNodes],
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
              {/* <header className="text-editor-header">
                <a href="https://lexical.dev" target="_blank" rel="noreferrer">
                  <Image
                    src={logo}
                    alt="Lexical Logo"
                    width={100} // specify width
                    height={100} // specify height
                  />
                </a>
              </header> */}

              <div className="editor-shell">
                <PDFDownloadPlugin />
                <ClientEditorWrapper preloadedJSON={preloadedJSON} />
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
export default function PlaygroundApp({ PRELOADED_JSON }) {
  return (
    <SettingsContext>
      <FlashMessageContext>
        <App preloadedJSON={PRELOADED_JSON} />
      </FlashMessageContext>
    </SettingsContext>
  );
}
