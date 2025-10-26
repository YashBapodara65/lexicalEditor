  import {
    createCommand,
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    TextNode,
  } from "lexical";
  import { $createReadOnlyTextNode } from "../nodes/ReadOnlyTextNode";

  export const LOCK_TEXT_COMMAND = createCommand();
  export const UNLOCK_TEXT_COMMAND = createCommand();

  export function registerLockUnlockCommands(editor) {
    // ✅ LOCK
    editor.registerCommand(
      LOCK_TEXT_COMMAND,
      () => {
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          selection.getNodes().forEach((node) => {
            if ($isTextNode(node) && node.getType() !== "custom-text") {
              const roNode = $createReadOnlyTextNode(node.getText());
              node.replace(roNode);
            }
          });
        });
        return true;
      },
      1
    );

    // ✅ UNLOCK
    editor.registerCommand(
      UNLOCK_TEXT_COMMAND,
      () => {
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          selection.getNodes().forEach((node) => {
            if (node.getType && node.getType() === "custom-text") {
              const textNode = new TextNode(node.getText());
              node.replace(textNode);
            }
          });
        });
        return true;
      },
      1
    );
  }
