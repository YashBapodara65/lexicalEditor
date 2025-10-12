// "use client";

// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
// import { $generateNodesFromDOM } from "@lexical/html";
// import Button from "../ui/Button";
// import { DivNode } from "../nodes/DivNode"; // import your custom node
// import { $getRoot } from "lexical";

// export default function ImportHTMLPlugin() {
//   const [editor] = useLexicalComposerContext();

//   const handleImport = () => {
// const htmlString = `
//   <div class="note flex justify-between" style="justify-content: space-between; background-color: #f0f0f0; padding: 10px;">
//     <span class="text-red-600">Leftsssssss</span>
//     <span>Right</span>
//   </div>
// `;


//     const dom = new DOMParser().parseFromString(htmlString, "text/html");

// editor.update(() => {
//   const root = $getRoot();

//   const nodes = $generateNodesFromDOM(editor, dom);

//   nodes.forEach((node) => {
//     if (node instanceof DivNode) {
//       const div = dom.querySelector("div");
//       node.nodeHTML = div?.innerHTML || "";
//     }
//     root.append(node);
//   });
// });
//   };

//   return (
//     <div className="p-2">
//       <Button onClick={handleImport}>Import HTML</Button>
//     </div>
//   );
// }

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import Button from "../ui/Button";
import { DivNode } from "../nodes/DivNode";
import { $getRoot } from "lexical";

export default function ImportHTMLPlugin() {
  const [editor] = useLexicalComposerContext();

  const handleImport = () => {
 editor.update(() => {
  const root = $getRoot();

  // Create a new DivNode instance each time
  const divNode = new DivNode(
    "note flex justify-between",
    `
      <span class="text-red-600">Left</span>
      <span>Right</span>
    `
  );

  root.append(divNode);
});

  };

  return (
    <div className="p-2">
      <Button onClick={handleImport}>Import HTML</Button>
    </div>
  );
}
