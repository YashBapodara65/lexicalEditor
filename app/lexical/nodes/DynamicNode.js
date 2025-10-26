import { ElementNode } from "lexical";
import React from "react";

export class DynamicNode extends ElementNode {
  static getType() {
    return "dynamic";
  }

  static clone(node) {
    return new DynamicNode(
      {
        fields: node.__fields,
        extra: node.__extra,
        Component: node.__Component,
      },
      node.__key
    );
  }

  constructor({ fields = [], Component = null, extra = {} }, key) {
    super(key);
    this.__fields = fields;
    this.__extra = extra;
    this.__Component = Component;
  }

  get fields() {
    return this.__fields;
  }

  get extra() {
    return this.__extra;
  }

  updateFields(fields) {
    this.__fields = fields;
  }

  updateExtra(extra) {
    this.__extra = extra;
  }

  createDOM() {
    return document.createElement("div");
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return this.__Component ? (
      <this.__Component node={this} onEdit={this.__extra?.onEdit} />
    ) : null;
  }

  exportJSON() {
    const children = [];

    // Convert fields to paragraphs
    this.__fields.forEach((f) => {
      if (f.title)
        children.push({
          type: "paragraph",
          version: 1,
          children: [
            {
              type: "text",
              version: 1,
              text: f.title,
              detail: 0,
              format: 0,
              style: "",
              mode: "normal",
            },
          ],
          direction: null,
          format: "",
          indent: 0,
          textFormat: 0,
          textStyle: "",
        });
      if (f.value)
        children.push({
          type: "paragraph",
          version: 1,
          children: [
            {
              type: "text",
              version: 1,
              text: f.value,
              detail: 0,
              format: 0,
              style: "",
              mode: "normal",
            },
          ],
          direction: null,
          format: "",
          indent: 0,
          textFormat: 0,
          textStyle: "",
        });
    });

    // Add logo if present
    if (this.__extra?.logo) {
      children.push({
        type: "paragraph",
        version: 1,
        children: [
          {
            type: "image",
            version: 1,
            src: this.__extra.logo.value,
            altText: "",
            height: 0,
            width: 0,
            maxWidth: 500,
            showCaption: false,
            caption: {
              editorState: {
                root: {
                  type: "root",
                  version: 1,
                  children: [],
                  direction: null,
                  format: "",
                  indent: 0,
                },
              },
            },
          },
        ],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
      });
    }

    return {
      type: DynamicNode.getType(),
      version: 1,
      fields: this.__fields,
      extra: this.__extra,
      children,
    };
  }

  static importJSON(serializedNode) {
    const node = new DynamicNode({
      fields: serializedNode.fields || [],
      extra: serializedNode.extra || {},
    });

    if (serializedNode.children) {
      serializedNode.children.forEach((childJSON) => {
        const childNode = ElementNode.importJSON(childJSON);
        node.append(childNode);
      });
    }

    return node;
  }
}
