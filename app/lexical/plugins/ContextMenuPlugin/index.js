import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  NodeContextMenuOption,
  NodeContextMenuPlugin,
  NodeContextMenuSeparator,
} from '@lexical/react/LexicalNodeContextMenuPlugin';
import {
  $getSelection,
  $isDecoratorNode,
  $isNodeSelection,
  $isRangeSelection,
  COPY_COMMAND,
  CUT_COMMAND,
  PASTE_COMMAND,
} from 'lexical';
import { useMemo } from 'react';

export default function ContextMenuPlugin() {
  const [editor] = useLexicalComposerContext();

  const items = useMemo(() => {
    return [
      new NodeContextMenuOption(`Remove Link`, {
        $onSelect: () => {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        },
        $showOn: (node) => $isLinkNode(node.getParent()),
        disabled: false,
        icon: <i className="PlaygroundEditorTheme__contextMenuItemIcon" />,
      }),
      new NodeContextMenuSeparator({
        $showOn: (node) => $isLinkNode(node.getParent()),
      }),
      new NodeContextMenuOption(`Cut`, {
        $onSelect: () => {
          editor.dispatchCommand(CUT_COMMAND, null);
        },
        disabled: false,
        icon: (
          <i className="PlaygroundEditorTheme__contextMenuItemIcon page-break" />
        ),
      }),
      new NodeContextMenuOption(`Copy`, {
        $onSelect: () => {
          editor.dispatchCommand(COPY_COMMAND, null);
        },
        disabled: false,
        icon: <i className="PlaygroundEditorTheme__contextMenuItemIcon copy" />,
      }),
      new NodeContextMenuOption(`Paste`, {
        $onSelect: () => {
          navigator.clipboard.read().then(async function () {
            const data = new DataTransfer();

            const readClipboardItems = await navigator.clipboard.read();
            const item = readClipboardItems[0];

            const permission = await navigator.permissions.query({
              name: 'clipboard-read', // not typed correctly, but works
            });
            if (permission.state === 'denied') {
              alert('Not allowed to paste from clipboard.');
              return;
            }

            for (const type of item.types) {
              const dataString = await (await item.getType(type)).text();
              data.setData(type, dataString);
            }

            const event = new ClipboardEvent('paste', {
              clipboardData: data,
            });

            editor.dispatchCommand(PASTE_COMMAND, event);
          });
        },
        disabled: false,
        icon: (
          <i className="PlaygroundEditorTheme__contextMenuItemIcon paste" />
        ),
      }),
      new NodeContextMenuOption(`Paste as Plain Text`, {
        $onSelect: () => {
          navigator.clipboard.read().then(async function () {
            const permission = await navigator.permissions.query({
              name: 'clipboard-read', // not typed correctly, but works
            });

            if (permission.state === 'denied') {
              alert('Not allowed to paste from clipboard.');
              return;
            }

            const data = new DataTransfer();
            const clipboardText = await navigator.clipboard.readText();
            data.setData('text/plain', clipboardText);

            const event = new ClipboardEvent('paste', {
              clipboardData: data,
            });
            editor.dispatchCommand(PASTE_COMMAND, event);
          });
        },
        disabled: false,
        icon: <i className="PlaygroundEditorTheme__contextMenuItemIcon" />,
      }),
      new NodeContextMenuSeparator(),
      new NodeContextMenuOption(`Delete Node`, {
        $onSelect: () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const currentNode = selection.anchor.getNode();
            const ancestorNodeWithRootAsParent = currentNode
              .getParents()
              .at(-2);

            ancestorNodeWithRootAsParent?.remove();
          } else if ($isNodeSelection(selection)) {
            const selectedNodes = selection.getNodes();
            selectedNodes.forEach((node) => {
              if ($isDecoratorNode(node)) {
                node.remove();
              }
            });
          }
        },
        disabled: false,
        icon: (
          <i className="PlaygroundEditorTheme__contextMenuItemIcon clear" />
        ),
      }),
    ];
  }, [editor]);

  return (
    <NodeContextMenuPlugin
      className="PlaygroundEditorTheme__contextMenu"
      itemClassName="PlaygroundEditorTheme__contextMenuItem"
      separatorClassName="PlaygroundEditorTheme__contextMenuSeparator"
      items={items}
    />
  );
}