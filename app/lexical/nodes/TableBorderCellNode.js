import { TableCellNode } from "@lexical/table";

export class TableBorderCellNode extends TableCellNode {

  static getType() {
    return "custom-tablecell";
  }

  constructor(headerState = 0, colSpan = 1, rowSpan = 1, style = "", backgroundColor = null, key) {
    super(headerState, colSpan, rowSpan, key);
    this.__rowSpan = rowSpan;
    this.__backgroundColor = backgroundColor || null;
    this.__style = style || "";
  }

createDOM(config) {
  const dom = super.createDOM(config);

  if (this.__colSpan > 1) dom.setAttribute("colspan", this.__colSpan);
  if (this.__rowSpan > 1) dom.setAttribute("rowspan", this.__rowSpan);

  // Apply background color
  if (this.__backgroundColor) {
    dom.style.backgroundColor = this.__backgroundColor;
  }

  // Merge any other styles from __style
  if (this.__style) {
    this.__style.split(";").forEach((s) => {
      const [prop, value] = s.split(":");
      if (prop && value) dom.style[prop.trim()] = value.trim();
    });
  }

  return dom;
}

updateDOM(prevNode, dom, config) {
  const isUpdated = super.updateDOM(prevNode, dom, config);

  if (this.__colSpan !== prevNode.__colSpan) dom.setAttribute("colspan", this.__colSpan);
  if (this.__rowSpan !== prevNode.__rowSpan) dom.setAttribute("rowspan", this.__rowSpan);

  // Update background color
  if (this.__backgroundColor !== prevNode.__backgroundColor) {
    dom.style.backgroundColor = this.__backgroundColor || "";
  }

  // Update other styles
  if (this.__style !== prevNode.__style) {
    // Clear previous style entries (except backgroundColor)
    dom.style.cssText = dom.style.cssText
      .split(";")
      .filter((rule) => !rule.includes("background-color"))
      .join(";");

    // Apply new style entries
    this.__style.split(";").forEach((s) => {
      const [prop, value] = s.split(":");
      if (prop && value) dom.style[prop.trim()] = value.trim();
    });
  }

  return isUpdated;
}


  getStyle() {
    return this.__style;
  }

  setStyle(style) {
    const writable = this.getWritable();
    writable.__style = style;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "custom-tablecell",
      rowSpan: this.__rowSpan,
      backgroundColor: this.__backgroundColor,
      style: this.__style || "",
    };
  }

  static importJSON(serializedNode) {
    const { headerState, colSpan, rowSpan, style, backgroundColor, key } = serializedNode;
    return new TableBorderCellNode(headerState, colSpan, rowSpan, style, backgroundColor, key);
  }
}
