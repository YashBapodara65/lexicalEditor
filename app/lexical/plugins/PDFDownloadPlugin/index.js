"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

export default function PDFDownloadPlugin() {
  const [editor] = useLexicalComposerContext();

  const handleDownloadPDF = async () => {
    const editorRoot = editor.getRootElement();
    if (!editorRoot) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    let currentHeight = margin;

    const children = Array.from(editorRoot.children);

    for (const node of children) {
      // Save and modify styles
      const originalStyles = {
        width: node.style.width,
        height: node.style.height,
        overflow: node.style.overflow,
      };
      node.style.width = `${node.scrollWidth}px`;
      node.style.height = `${node.scrollHeight + 4}px`;
      node.style.overflow = "visible";
      node.style.paddingBottom = "4px";

      // Convert node to JPEG (compressed)
      const dataUrl = await htmlToImage.toJpeg(node, {
        pixelRatio: 1.2, // lower = smaller file
        quality: 1, // 0–1 (1 = max quality)
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      // Restore styles
      node.style.width = originalStyles.width;
      node.style.height = originalStyles.height;
      node.style.overflow = originalStyles.overflow;
      node.style.paddingBottom = "";

      // Load image to add to PDF
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = () => {
          const drawWidthMM = pdfWidth - 2 * margin;
          const pxPerMm = img.width / drawWidthMM;
          const drawHeightMM = img.height / pxPerMm;

          // Page break
          if (currentHeight + drawHeightMM > pdfHeight - margin) {
            pdf.addPage();
            currentHeight = margin;
          }

          pdf.addImage(
            img,
            "JPEG",
            margin,
            currentHeight,
            drawWidthMM,
            drawHeightMM - 0.5
          );

          currentHeight += drawHeightMM + 2;
          resolve();
        };
        img.src = dataUrl;
      });
    }

    pdf.save("lexical_compressed.pdf");
  };

  return (
    <button
      onClick={handleDownloadPDF}
      style={{
        padding: "8px 16px",
        borderRadius: "6px",
        backgroundColor: "#1877f2",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}
    >
      Download PDF
    </button>
  );
}
