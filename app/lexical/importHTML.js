// importHTML.js
import { $generateNodesFromDOM } from "@lexical/html";
import { $createTextNode } from "lexical";
import { $createDivNode } from "./nodes/DivNode"; // adjust path if needed

export function importHTML(htmlString, editor) {
  const dom = new DOMParser().parseFromString(htmlString, "text/html");

  editor.update(() => {
    const nodes = $generateNodesFromDOM(editor, dom, {
      DIV: (element, children) => {
        const divNode = $createDivNode(
          element.className,
          element.getAttribute("style") || ""
        );
        children.forEach((child) => divNode.append(child));
        return divNode;
      },
      SPAN: (element) => {
        const text = element.textContent || "";
        const textNode = $createTextNode(text);
        const style = element.getAttribute("style") || "";
        if (style.includes("color:red")) textNode.setStyle("color:red;");
        return textNode;
      },
    });

    editor.insertNodes(nodes);
  });
}
