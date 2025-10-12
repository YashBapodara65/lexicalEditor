// nodes/HeaderNode.js
import { ElementNode } from "lexical";
import React from "react";

export class HeaderNode extends ElementNode {
  static getType() {
    return "header-node";
  }

  static clone(node) {
    return new HeaderNode(node.__fields, node.__Component, node.__extra, node.__key);
  }

  constructor(fields = [], Component = null, extra = {}, key) {
    super(key);
    this.__fields = Array.isArray(fields) ? fields : [];
    this.__Component = Component;
    this.__extra = extra || {};
  }

  createDOM() {
    const div = document.createElement("div");
    div.className = "header-node-wrapper";
    return div;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return this.__Component
      ? <this.__Component node={this} onEdit={this.__extra?.onEdit} />
      : null;
  }

  // -------------------- NEW exportJSON --------------------
 exportJSON() {
  // Lexical-compatible JSON (required!)
  return {
    type: this.__type, // must match getType() => "dynamic"
    version: 1,
    fields: this.__fields.map((f) => ({ ...f })),
    domProps: { ...this.__domProps },
    extra: { ...this.__extra },
  };
}

// New helper method to export in "text + image" format
exportAsTextImage() {
  const children = [];

  if (this.__fields?.length) {
    this.__fields.forEach((f) => {
      children.push({
        type: "text",
        version: 1,
        detail: 0,
        format: 0,
        mode: "normal",
        style: "",
        text: `${f.title}: ${f.value}`,
      });
    });
  }

  if (this.__extra?.logo) {
    children.push({
      type: "image",
      version: 1,
      altText: this.__extra.alt || "",
      caption: {
        editorState: {
          root: {
            children: [],
            direction: null,
            format: "",
            indent: 0,
            type: "root",
            version: 1,
          },
        },
      },
      height: 0,
      width: 0,
      maxWidth: 500,
      showCaption: false,
      src: this.__extra.logo,
    });
  }

  return {
    type: "paragraph",
    version: 1,
    textFormat: 0,
    textStyle: "",
    children,
  };
}


  static importJSON(serializedNode) {
    return new HeaderNode([], null, {});
  }
}
