import { ElementNode } from "lexical";

export class DivNode extends ElementNode {
  __className;
  __style;

  constructor(className = "", style = "", key) {
    super(key);
    this.__className = className;
    this.__style = style;
  }

  static getType() {
    return "div-node";
  }

  static clone(node) {
    return new DivNode(node.__className, node.__style, node.__key);
  }

  createDOM() {
    const div = document.createElement("div");
    div.className = this.__className;
    div.setAttribute("style", this.__style);
    return div;
  }

  updateDOM(prevNode, dom) {
    if (prevNode.__className !== this.__className) dom.className = this.__className;
    if (prevNode.__style !== this.__style) dom.setAttribute("style", this.__style);
    return false;
  }

  static importJSON(serializedNode) {
    const { className = "", style = "", children = [] } = serializedNode;
    const node = $createDivNode(className, style);
    children.forEach((child) => node.append(child));
    return node;
  }

  exportJSON() {
    return {
      type: "div-node",
      className: this.__className,
      style: this.__style,
      version: 1,
      children: this.getChildren().map((child) => child.exportJSON()), // ✅ must include
    };
  }
}

// Factory function
export function $createDivNode(className = "", style = "") {
  return new DivNode(className, style);
}
