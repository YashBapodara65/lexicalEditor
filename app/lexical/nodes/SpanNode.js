import { TextNode } from "lexical";

export class SpanNode extends TextNode {
  constructor(className, style = "", key) {
    super("", key);
    this.__className = className;
    this.__style = style;
  }

  static getType() {
    return "span";
  }

  static clone(node) {
    return new SpanNode(node.__className, node.__style, node.__key);
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    dom.className = this.__className;
    dom.setAttribute("style", this.__style);
    return dom;
  }

  exportDOM() {
    const span = document.createElement("span");
    span.className = this.__className;
    span.setAttribute("style", this.__style);
    span.textContent = this.getTextContent();
    return { element: span };
  }
}

export function $createSpanNode(className, style = "") {
  return new SpanNode(className, style);
}
