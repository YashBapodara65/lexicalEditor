import './index.css';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin';
import { $createParagraphNode, $getNearestNodeFromDOMNode } from 'lexical';
import { useRef, useState } from 'react';

const DRAGGABLE_BLOCK_MENU_CLASSNAME = 'draggable-block-menu';

function isOnMenu(element) {
  return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}

export default function DraggableBlockPlugin({ anchorElem = document.body }) {
  const [editor] = useLexicalComposerContext();
  const menuRef = useRef(null);
  const targetLineRef = useRef(null);
  const [draggableElement, setDraggableElement] = useState(null);

  function insertBlock(e) {
    if (!draggableElement || !editor) {
      return;
    }

    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(draggableElement);
      if (!node) {
        return;
      }

      const pNode = $createParagraphNode();
      if (e.altKey || e.ctrlKey) {
        node.insertBefore(pNode);
      } else {
        node.insertAfter(pNode);
      }
      pNode.select();
    });
  }

  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={anchorElem}
      menuRef={menuRef}
      targetLineRef={targetLineRef}
      menuComponent={
        <div ref={menuRef} className="icon draggable-block-menu">
          <button
            title="Click to add below"
            className="icon icon-plus"
            onClick={insertBlock}
          />
          <div className="icon" />
        </div>
      }
      targetLineComponent={
        <div ref={targetLineRef} className="draggable-block-target-line" />
      }
      isOnMenu={isOnMenu}
      onElementChanged={setDraggableElement}
    />
  );
}