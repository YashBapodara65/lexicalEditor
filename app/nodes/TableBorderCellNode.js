import { TableCellNode } from "@lexical/table";

export class TableBorderCellNode extends TableCellNode {
  constructor(
    headerState = 0,
    borders = { top: true, bottom: true, left: true, right: true },
    key
  ) {
    super(headerState, undefined, undefined, key);
    this.__borders = borders ?? { top: true, bottom: true, left: true, right: true };
  }

  static getType() {
    return "custom-table-cell";
  }

  static clone(node) {
    return new TableBorderCellNode(
      node.__headerState,
      { ...node.__borders },
      node.__key
    );
  }

  static importJSON(serializedNode) {
    return new TableBorderCellNode(
      serializedNode.headerState ?? 0,
      serializedNode.borders ?? { top: true, bottom: true, left: true, right: true }
    );
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "custom-table-cell",
      borders: this.__borders,
    };
  }

  setBorders(borders) {
    const writable = this.getWritable();
    writable.__borders = borders;
  }

  getBorders() {
    return this.__borders;
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    this.applyBordersToDOM(dom);
    return dom;
  }

  updateDOM(prevNode, dom) {
    if (JSON.stringify(prevNode.__borders) !== JSON.stringify(this.__borders)) {
      this.applyBordersToDOM(dom);
    }
    return false; // no DOM recreation needed
  }

  applyBordersToDOM(dom) {
    const { top, bottom, left, right } = this.__borders;
    dom.style.borderTop = top ? "1px solid #000" : "none";
    dom.style.borderBottom = bottom ? "1px solid #000" : "none";
    dom.style.borderLeft = left ? "1px solid #000" : "none";
    dom.style.borderRight = right ? "1px solid #000" : "none";
  }
}
