import { TextNode } from "lexical";

export class ReadOnlyTextNode extends TextNode {
  __id;
  __readonly;

  static getType() {
    return "readonly-text";
  }

  static clone(node) {
    return new ReadOnlyTextNode(
      node.__text,
      node.__id,
      node.__readonly,
      node.__key
    );
  }

  constructor(text, id = crypto.randomUUID(), readonly = true, key) {
    super(text, key);
    this.__id = id;
    this.__readonly = readonly;
  }

  // 🔒 Prevent editing inside this node
  canInsertTextBefore() {
    return !this.__readonly;
  }

  canInsertTextAfter() {
    return !this.__readonly;
  }

  canBeEmpty() {
    return !this.__readonly;
  }

  isTextEntity() {
    return this.__readonly; // so it behaves like a single immutable unit
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    if (this.__readonly) {
      dom.setAttribute("contenteditable", "false");
      dom.classList.add("readonly-text");
    }
    return dom;
  }

  updateDOM(prevNode, dom, config) {
    const isUpdated = super.updateDOM(prevNode, dom, config);
    if (prevNode.__readonly !== this.__readonly) {
      dom.setAttribute("contenteditable", this.__readonly ? "false" : "true");
    }
    return isUpdated;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      id: this.__id,
      readonly: this.__readonly,
    };
  }

  static importJSON(serializedNode) {
    const node = new ReadOnlyTextNode(
      serializedNode.text,
      serializedNode.id,
      serializedNode.readonly
    );
    node.setFormat(serializedNode.format);
    node.setStyle(serializedNode.style);
    return node;
  }

  isReadOnly() {
    return this.__readonly;
  }

  setReadOnly(value) {
    this.getWritable().__readonly = value;
  }
}

export function $createReadOnlyTextNode(text, id, readonly) {
  return new ReadOnlyTextNode(text, id, readonly);
}

export function $isReadOnlyTextNode(node) {
  return node instanceof ReadOnlyTextNode;
}
