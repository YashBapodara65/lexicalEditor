import { $isAtNodeEnd } from '@lexical/selection';
import { ElementNode, TextNode } from 'lexical';

export function getSelectedNode(selection) {
  if (!selection) return null;
  const anchor = selection.anchor;
  const focus = selection.focus;

  if (!anchor || !focus) return null;

  const anchorNode = anchor.getNode();
  const focusNode = focus.getNode();

  if (!anchorNode || !focusNode) return null;

  if (anchorNode === focusNode) {
    return anchorNode;
  }

  const isBackward = selection.isBackward();

  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}
