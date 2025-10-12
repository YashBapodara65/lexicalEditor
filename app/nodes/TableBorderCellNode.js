import { TableCellNode } from "@lexical/table";
import { v4 as uuidv4 } from "uuid";

export class CustomTableCellNode extends TableCellNode {
  __borders;
  __id;
  __backgroundColor;
  __rowSpan;

  static getType() {
    return "custom-tablecell";
  }

  static clone(node) {
    return new CustomTableCellNode(
      node.__headerState,
      node.__colSpan,
      node.__rowSpan,
      node.__borders ? { ...node.__borders } : { top: true, right: true, bottom: true, left: true },
      node.__id,
      node.__backgroundColor,
      node.__key
    );
  }

  constructor(
    headerState = 0,
    colSpan = 1,
    rowSpan = 1, // default 1
    borders = null,
    id = null,
    backgroundColor = null,
    key
  ) {
    super(headerState, colSpan, rowSpan, key);
    this.__borders = borders || { top: true, right: true, bottom: true, left: true };
    this.__id = id || uuidv4();
    this.__backgroundColor = backgroundColor || null;
    this.__rowSpan = rowSpan; // store rowSpan
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "custom-tablecell",
      id: this.__id,
      borders: this.__borders,
      backgroundColor: this.__backgroundColor,
      rowSpan: this.__rowSpan,
    };
  }

  static importJSON(serializedNode) {
    const { headerState, colSpan, rowSpan, id, borders, backgroundColor, key } = serializedNode;
    return new CustomTableCellNode(
      headerState,
      colSpan,
      rowSpan,
      borders,
      id,
      backgroundColor,
      key
    );
  }

  createDOM(config) {
    const dom = super.createDOM(config);

    // Apply colSpan and rowSpan to the DOM
    if (this.__colSpan > 1) dom.setAttribute("colspan", this.__colSpan);
    if (this.__rowSpan > 1) dom.setAttribute("rowspan", this.__rowSpan);

    // Applt backgrounds
    if (this.__backgroundColor) dom.style.backgroundColor = this.__backgroundColor;

    // Apply borders
  this.applyBordersToDOM(dom);

    return dom;
  }

  updateDOM(prevNode, dom, config) {
    const isUpdated = super.updateDOM(prevNode, dom, config);

    // Update colSpan and rowSpan if changed
    if (this.__colSpan !== prevNode.__colSpan) {
      dom.setAttribute("colspan", this.__colSpan);
    }
    if (this.__rowSpan !== prevNode.__rowSpan) {
      dom.setAttribute("rowspan", this.__rowSpan);
    }

    // Update background color if changed
    if (this.__backgroundColor !== prevNode.__backgroundColor) {
      dom.style.backgroundColor = this.__backgroundColor || "";
    }

      // Update borders if changed
  if (JSON.stringify(this.__borders) !== JSON.stringify(prevNode.__borders)) {
    this.applyBordersToDOM(dom);
  }

    return isUpdated;
  }

  // Helper method to apply border styles
applyBordersToDOM(dom) {
  const borders = this.__borders || { top: true, right: true, bottom: true, left: true };
  dom.style.borderTop = borders.top ? "1px solid #000" : "none";
  dom.style.borderRight = borders.right ? "1px solid #000" : "none";
  dom.style.borderBottom = borders.bottom ? "1px solid #000" : "none";
  dom.style.borderLeft = borders.left ? "1px solid #000" : "none";
}

// Setters and getters
setBorders(borders) {
  const writable = this.getWritable();
  writable.__borders = { ...borders };
}

getBorders() {
  return this.__borders;
}

  setRowSpan(rowSpan) {
    const writable = this.getWritable();
    writable.__rowSpan = rowSpan;
  }

  getRowSpan() {
    return this.__rowSpan;
  }
}
