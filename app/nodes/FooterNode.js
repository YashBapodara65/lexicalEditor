import { DecoratorNode } from "lexical";
import { FooterComponent } from "../plugins/FooterPlugin";

export class FooterNode extends DecoratorNode {
  static getType() {
    return "footer-node";
  }

  static clone(node) {
    return new FooterNode(node.__fields, node.__key);
  }

  constructor(fields = [], key) {
    super(key);
    this.__fields = fields;
  }

  // Minimal DOM container
  createDOM() {
    const div = document.createElement("div");
    div.className = "footer-node-wrapper";
    return div;
  }

  decorate() {
    return <FooterComponent fields={this.__fields} />;
  }

  exportJSON() {
    return {
      type: "footer-node",
      version: 1,
      fields: this.__fields,
    };
  }

  static importJSON(serializedNode) {
    return new FooterNode(serializedNode.fields || []);
  }

  isInline() {
    return false;
  }

  isIsolated() {
    return true;
  }
}
