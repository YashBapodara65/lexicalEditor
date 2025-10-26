import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';
import { $createParagraphNode, $getRoot } from 'lexical';
import { $createPageBreakNode } from '../../nodes/PageBreakNode';

const A4_HEIGHT_PX = 1302;
const THRESHOLD = 20;

export default function AutoPageBreakPlugin() {
  const [editor] = useLexicalComposerContext();
  const isInserting = useRef(false);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const checkAndUpdateBreaks = () => {
      if (isInserting.current) return;
      const height = rootElement.scrollHeight;

      editor.update(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const pageBreaks = children.filter(
          (node) => node.getType && node.getType() === 'page-break'
        );

        const requiredBreaks = Math.floor((height + THRESHOLD) / A4_HEIGHT_PX);

        // Remove extra page breaks
        if (pageBreaks.length > requiredBreaks) {
          for (let i = requiredBreaks; i < pageBreaks.length; i++) {
            pageBreaks[i].remove();
          }
        }

        // Insert new page break if needed
        const lastChild = root.getLastChild();
        if (pageBreaks.length < requiredBreaks) {
          if (lastChild?.getType && lastChild.getType() === 'page-break') return;
          isInserting.current = true;

          const pageBreakNode = $createPageBreakNode();
          const insertedNode = lastChild
            ? lastChild.insertAfter(pageBreakNode)
            : root.append(pageBreakNode);

          // Ensure cursor moves after page break
          const nextSibling = insertedNode.getNextSibling();
          if (nextSibling) {
            nextSibling.select();
          } else {
            const paragraphNode = $createParagraphNode();
            insertedNode.insertAfter(paragraphNode);
            paragraphNode.select();
          }

          setTimeout(() => {
            isInserting.current = false;
          }, 50);
        }
      });
    };

    const observer = new MutationObserver(checkAndUpdateBreaks);
    observer.observe(rootElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [editor]);

  return null;
}
