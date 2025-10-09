import { TextNode } from "lexical";

// Helper to generate UUID
function generateId() {
  return crypto.randomUUID?.() || Math.random().toString(36).substring(2, 10);
}

export class ReadOnlyTextNode extends TextNode {
  static getType() {
    return "readonly-text"; // matches class type
  }

  static clone(node) {
    return new ReadOnlyTextNode(node.__text, node.__key, node.__id);
  }

  static importJSON(serializedNode) {
    const { text = "", id = null } = serializedNode;
    return new ReadOnlyTextNode(text, id);
  }

  constructor(text = "", key = null, id = null) {
    super(text, key);
    this.readonly = true;
    this.__id = id || generateId(); 
  }

  isReadOnly() {
    return true;
  }

  canHaveChildren() {
    return false;
  }

  isEditable() {
    return false;
  }

  exportJSON() {
    const json = super.exportJSON();
    json.readonly = true;
    json.type = ReadOnlyTextNode.getType(); // ✅ must match getType
    json.id = this.__id;
    return json;
  }
}

export function $createReadOnlyTextNode(text = "", id = null) {
  return new ReadOnlyTextNode(text,null,id);
}
