import { ParagraphNode } from "lexical";
import { v4 as uuidv4 } from "uuid";

export class CustomParagraph extends ParagraphNode {
  constructor(key, id, readonly = false, doc_id = null, parent_id = null, format = "left") {
    super(key);
    this.__id = id || uuidv4();
    this.__readonly = readonly;
    this.__doc_id = doc_id;
    this.__parent_id = parent_id;
    this.__format = format; // store format from JSON
  }

  static getType() {
    return "custom-paragraph";
  }

  static clone(node) {
    return new CustomParagraph(
      node.__key,
      node.__id,
      node.__readonly,
      node.__doc_id,
      node.__parent_id,
      node.__format
    );
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    // Apply text alignment using format
    dom.style.textAlign = this.__format || "left";
    if (this.__readonly) {
      dom.setAttribute("contenteditable", "false");
    }
    return dom;
  }

  updateDOM(prevNode, dom, config) {
    if (prevNode.__format !== this.__format) {
      dom.style.textAlign = this.__format || "left";
    }
    return false; // no full replacement needed
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "custom-paragraph",
      id: this.__id,
      readonly: this.__readonly,
      doc_id: this.__doc_id,
      parent_id: this.__parent_id,
      format: this.__format, // export format
      version: 1,
    };
  }

  static importJSON(serializedNode) {
    return new CustomParagraph(
      null,
      serializedNode.id,
      serializedNode.readonly,
      serializedNode.doc_id,
      serializedNode.parent_id,
      serializedNode.format || "left"
    );
  }
}
