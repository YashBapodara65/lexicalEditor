import { TextNode } from "lexical";

export class ReadOnlyTextNode extends TextNode {
  __id;
  __readonly;
  __doc_id;
  __parent_id;

  static getType() {
    return "custom-text";
  }

  static clone(node) {
    return new ReadOnlyTextNode(
      node.__text,
      node.__id,
      node.__readonly,
      node.__key,
      node.__doc_id,
      node.__parent_id
    );
  }

  constructor(
    text,
    id = crypto.randomUUID(),
    readonly = false,
    key,
    doc_id = null,
    parent_id = null
  ) {
    super(text, key);
    this.__id = id;
    this.__readonly = readonly;
    this.__doc_id = doc_id;
    this.__parent_id = parent_id;
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
    return this.__readonly;
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    if (this.__readonly) {
      dom.setAttribute("contenteditable", "false");
      dom.classList.add("custom-text");
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
      doc_id: this.__doc_id ?? null,
      parent_id: this.__parent_id ?? null,
    };
  }

  static importJSON(serializedNode) {
    const node = new ReadOnlyTextNode(
      serializedNode.text,
      serializedNode.id,
      serializedNode.readonly,
      undefined, // key
      serializedNode.doc_id ?? null,
      serializedNode.parent_id ?? null
    );

    if (serializedNode.format !== undefined) node.setFormat(serializedNode.format);
    if (serializedNode.style !== undefined) node.setStyle(serializedNode.style);

    return node;
  }

  isReadOnly() {
    return this.__readonly;
  }

  setReadOnly(value) {
    this.getWritable().__readonly = value;
  }
}

export function $createReadOnlyTextNode(text, id, readonly, doc_id, parent_id) {
  return new ReadOnlyTextNode(text, id, readonly, undefined, doc_id, parent_id);
}

export function $isReadOnlyTextNode(node) {
  return node instanceof ReadOnlyTextNode;
}