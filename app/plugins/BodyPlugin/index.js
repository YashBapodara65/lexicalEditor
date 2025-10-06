"use client";
import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes } from "lexical";
import { $createTwoFieldNode } from "../../nodes/BodyNode";

export default function TwoFieldPlugin() {
  const [editor] = useLexicalComposerContext();

  const insertNode = () => {
    editor.update(() => {
      // Insert a new node with 2 fields (Title & Value)
      const node = $createTwoFieldNode(["", ""]);
      $insertNodes([node]);
    });
  };

  return (
    <button
      onClick={insertNode}
      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      ➕ Add Title & Value Pair
    </button>
  );
}
