"use client";
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Extract plain text from JSON nodes
const extractText = (node) => {
  if (!node) return "";
  if (node.text) return node.text;
  if (node.children?.length) {
    return node.children.map(extractText).join(" ").trim();
  }
  return "";
};

// Parse CSS-like "key: value" from style or textStyle
const parseStyle = (str = "") => {
  const styles = {};
  if (str) {
    str.split(";").forEach((part) => {
      const [key, value] = part.split(":");
      if (key && value) styles[key.trim()] = value.trim();
    });
  }
  return styles;
};

// Convert both HEX & RGB format to [r,g,b]
const parseColorToRgb = (color) => {
  if (!color) return null;
  if (color.startsWith("#")) {
    return [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16),
    ];
  }
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  return match
    ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
    : null;
};

// Get font style from format bitmask
const getFontStyles = (format = 0) => {
  return {
    bold: !!(format & 1),
    italic: !!(format & 2),
    underline: !!(format & 8),
  };
};

// Convert bold+italic to jsPDF font string
const fontString = ({ bold, italic }) => {
  if (bold && italic) return "bolditalic";
  if (bold) return "bold";
  if (italic) return "italic";
  return "normal";
};

export default function PDFDownloader({ data, fileName = "export.pdf" }) {
  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "px", "a4");
    let y = 20;

    const renderNode = (node, indent = 0) => {
      if (!node) return;

      const text = extractText(node);

      // Compute styles
      const styles = parseStyle(node.textStyle || node.style);
      const color = styles.color ? parseColorToRgb(styles.color) : null;
      const bg = styles["background-color"]
        ? parseColorToRgb(styles["background-color"])
        : null;

      const { bold, italic, underline } = getFontStyles(node.format);

      // Set font and color
      doc.setFont("helvetica", fontString({ bold, italic }));
      if (color) doc.setTextColor(...color);

      // --- Handle Lists ---
      if (node.type === "list" && Array.isArray(node.children)) {
        const isOrdered = node.listType === "number";
        node.children.forEach((itemNode) => {
          if (itemNode.type === "listitem") {
            const textNode = itemNode.children?.[0];
            const text = extractText(textNode);
            const styles = parseStyle(
              textNode?.textStyle || textNode?.style || ""
            );
            const color = parseColorToRgb(styles.color || "#000000");

            // Get font styles from format
            const { bold, italic, underline } = getFontStyles(
              textNode?.format || 0
            );

            doc.setFont("helvetica", fontString({ bold, italic }));
            doc.setFontSize(12);
            doc.setTextColor(...color);

            const prefix = isOrdered ? `${itemNode.value}. ` : "• ";

            // Render text
            doc.text(prefix + text, 20, y);

            // Render underline if needed
            if (underline) {
              const textWidth = doc.getTextWidth(prefix + text);
              const underlineMargin = 1;
              doc.setDrawColor(...color);
              doc.line(
                20,
                y + underlineMargin,
                20 + textWidth,
                y + underlineMargin
              );
            }

            y += 8; // line spacing

            // Recursively render nested lists
            itemNode.children?.forEach((child) => renderNode(child));
          }
        });
      }

   // Heading
if (node.type === "heading") {
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 20;
  const rightMargin = 20;
  const lineMargin = 2;

  const textNodes = node.children.filter((c) => c.type === "text");
  const imageNodes = node.children.filter((c) => c.type === "image");

  const isSameLine = textNodes.length === 1 && imageNodes.length === 1;

  if (isSameLine) {
    // Justify-between: text left, image right
    const t = textNodes[0];
    const img = imageNodes[0];

    let formatValue = t.format || 0;
    const isUppercase = formatValue >= 512;
    const styleValue = formatValue - (isUppercase ? 512 : 256);
    const { bold, italic, underline } = getFontStyles(styleValue);

    const styles = parseStyle(t.style || node.textStyle || "");
    const fontFamily = styles["font-family"] || "helvetica";
    const fontSize = styles["font-size"] ? parseInt(styles["font-size"]) : 14;
    const color = styles.color ? parseColorToRgb(styles.color) : [0, 0, 0];

    doc.setFont(fontFamily, fontString({ bold, italic }));
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);

    // Image scaling
    let imgWidth = img.width || 100;
    let imgHeight = img.height || 100;
    const maxImgWidth = (pageWidth - leftMargin - rightMargin) / 2;
    if (imgWidth > maxImgWidth) {
      const scale = maxImgWidth / imgWidth;
      imgWidth *= scale;
      imgHeight *= scale;
    }

    const yCenter = y + Math.max(fontSize, imgHeight) / 2;

    // Draw text left with uppercase if needed
    let textContent = t.text || "";
    if (isUppercase) textContent = textContent.toUpperCase();

    doc.text(textContent, leftMargin, yCenter);
    if (underline) {
      doc.setDrawColor(...color);
      doc.setLineWidth(0.5);
      doc.line(leftMargin, yCenter + 1, leftMargin + doc.getTextWidth(textContent), yCenter + 1);
    }

    // Draw image right
    if (img.src) {
      doc.addImage(img.src, "PNG", pageWidth - rightMargin - imgWidth, yCenter - imgHeight / 2, imgWidth, imgHeight);
    }

    y += Math.max(fontSize, imgHeight) + lineMargin;
  } else {
    // Separate lines: always use child.format for alignment
    node.children.forEach((child) => {
      if (child.type === "text") {
        let formatValue = child.format || 0;
        const isUppercase = formatValue >= 512;
        const styleValue = formatValue - (isUppercase ? 512 : 256);
        const { bold, italic, underline } = getFontStyles(styleValue);

        const styles = parseStyle(child.style || node.textStyle || "");
        const fontFamily = styles["font-family"] || "helvetica";
        const fontSize = styles["font-size"] ? parseInt(styles["font-size"]) : 14;
        const color = styles.color ? parseColorToRgb(styles.color) : [0, 0, 0];

        doc.setFont(fontFamily, fontString({ bold, italic }));
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);

        let textContent = child.text || "";
        if (isUppercase) textContent = textContent.toUpperCase();

        const format = typeof child.format === "string" ? child.format : node.format || "left";
        let x = leftMargin;
        if (format === "center") x = (pageWidth - doc.getTextWidth(textContent)) / 2;
        else if (format === "right") x = pageWidth - rightMargin - doc.getTextWidth(textContent);

        doc.text(textContent, x, y);

        if (underline) {
          doc.setDrawColor(...color);
          doc.setLineWidth(0.5);
          doc.line(x, y + 1, x + doc.getTextWidth(textContent), y + 1);
        }

        y += fontSize + lineMargin;
      }

      if (child.type === "image" && child.src) {
        let imgWidth = child.width || 100;
        let imgHeight = child.height || 100;
        const maxWidth = pageWidth - leftMargin - rightMargin;
        if (imgWidth > maxWidth) {
          const scale = maxWidth / imgWidth;
          imgWidth *= scale;
          imgHeight *= scale;
        }

        const format = child.format || node.format || "left";
        let imgX = leftMargin;
        if (format === "center") imgX = (pageWidth - imgWidth) / 2;
        else if (format === "right") imgX = pageWidth - rightMargin - imgWidth;

        doc.addImage(child.src, "PNG", imgX, y, imgWidth, imgHeight);
        y += imgHeight + lineMargin;
      }
    });
  }
}


      // Table
      if (node.type === "table" && Array.isArray(node.children)) {
        const tableBody = node.children.map((row) =>
          row.children?.map((cell) => {
            const cellText = extractText(cell);
            const cellStylesRaw = parseStyle(cell.textStyle || cell.style);
            const textNode = cell.children?.[0]?.children?.[0];
            const textStylesRaw = parseStyle(
              textNode?.style || textNode?.textStyle
            );

            const textColor = parseColorToRgb(textStylesRaw.color) ||
              parseColorToRgb(cellStylesRaw.color) || [0, 0, 0];
            const bgColor =
              parseColorToRgb(textStylesRaw["background-color"]) ||
              parseColorToRgb(cellStylesRaw["background-color"]) ||
              parseColorToRgb(cell.backgroundColor) ||
              null;

            const { bold, italic, underline } = getFontStyles(
              textNode?.format || cell.format
            );

            return {
              content: cellText,
              colSpan: cell.colSpan || 1,
              rowSpan: cell.rowSpan || 1,
              styles: {
                halign:
                  cell.children?.[0]?.format === "center"
                    ? "center"
                    : cell.children?.[0]?.format === "right"
                      ? "right"
                      : "left",
                textColor: textColor,
                fillColor: bgColor,
                fontStyle: fontString({ bold, italic }),
                minCellHeight: 8,
              },
              underline,
            };
          })
        );

        autoTable(doc, {
          startY: y,
          body: tableBody,
          theme: "grid",
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 12,
            lineHeight: 1.2,
            minCellHeight: 12,
            cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
            valign: "middle", // ✅ Fix vertical alignment
          },
          didParseCell: function (data) {
            if (data.cell.rowSpan > 1 || data.cell.colSpan > 1) {
              data.cell.height = Math.max(data.cell.height, 15); // ✅ For merged cells only
            }
          },
          didDrawCell: (data) => {
            const { cell, row, column, table } = data;
            const raw = cell.raw;

            if (raw.underline && raw.content) {
              const text = raw.content;
              const textWidth = doc.getTextWidth(text);
              const textHeight = doc.getTextDimensions(text).h;

              // Base X position (left padding inside cell)
              let textX = data.cell.x + 2;
              let underlineY = null; // Adjust "3" if needed

              // Horizontal Alignment Fix
              if (cell.styles.halign === "center") {
                textX = data.cell.x + (cell.width - textWidth) / 2;
                underlineY = data.cell.y + cell.height / 2 + textHeight / 2;
              } else if (cell.styles.halign === "right") {
                textX = data.cell.x + cell.width - textWidth - 2;
                underlineY = data.cell.y + textHeight;
              }

              // ✅ Fix underline Y to be close to the text

              doc.setDrawColor(...cell.styles.textColor);
              doc.line(textX, underlineY, textX + textWidth, underlineY);
            }
          },
        });

        y = doc.lastAutoTable.finalY + 5;
      }

      node.children?.forEach(renderNode);
    };

    if (data?.root?.children) {
      data.root.children.forEach(renderNode);
    }

    doc.save(fileName);
  };

  return <button onClick={handleDownloadPDF}>Download PDF</button>;
}
