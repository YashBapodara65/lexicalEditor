import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $createPageBreakNode, $isPageBreakNode } from '../../nodes/PageBreakNode';
import { $getRoot } from 'lexical';

const A4_HEIGHT_PX = 1123; // Adjust if needed
const PAGE_MARGIN_PX = 40;

export default function AutoPageBreakPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;

    const checkOverflow = () => {
      const rootElem = editor.getRootElement();
      if (!rootElem) return;

      let accumulatedHeight = 0;
      const children = Array.from(rootElem.children);

      const breakPositions = [];

      children.forEach((child) => {
        const nodeKey = child.getAttribute('data-lexical-node-key');
        if (!nodeKey) return;

        const childHeight = child.getBoundingClientRect().height;
        accumulatedHeight += childHeight;

        if (accumulatedHeight >= A4_HEIGHT_PX - PAGE_MARGIN_PX) {
          breakPositions.push(nodeKey); // remember node to insert after
          accumulatedHeight = 0;
        }
      });

      if (breakPositions.length === 0) return;

      // Insert page breaks inside editor.update()
      editor.update(() => {
        const root = $getRoot();
        breakPositions.forEach((key) => {
          const node = root.getNodeByKey(key);
          if (node && !$isPageBreakNode(node)) {
            node.insertAfter($createPageBreakNode());
          }
        });
      });
    };

    const unregister = editor.registerUpdateListener(() => {
      requestAnimationFrame(checkOverflow);
    });

    requestAnimationFrame(checkOverflow); // initial check

    return () => unregister();
  }, [editor]);

  return null;
}
