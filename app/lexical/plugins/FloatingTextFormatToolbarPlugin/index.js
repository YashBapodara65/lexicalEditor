import "./index.css";

import { $isCodeHighlightNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $createTextNode,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  createCommand,
  FORMAT_TEXT_COMMAND,
  getDOMSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import * as React from "react";
import { createPortal } from "react-dom";

import { getDOMRangeRect } from "../../utils/getDOMRangeRect";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { setFloatingElemPosition } from "../../utils/setFloatingElemPosition";
import { INSERT_INLINE_COMMAND } from "../CommentPlugin";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { $isReadOnlyTextNode, ReadOnlyTextNode } from "../../nodes/ReadOnlyTextNode";
import { LOCK_TEXT_COMMAND, registerLockUnlockCommands, UNLOCK_TEXT_COMMAND } from "../../utils/readOnlyLockUnlock";

function TextFormatFloatingToolbar({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isUppercase,
  isLowercase,
  isCapitalize,
  isCode,
  isStrikethrough,
  isSubscript,
  isSuperscript,
  setIsLinkEditMode,
}) {


  useEffect(() => {
    registerLockUnlockCommands(editor);
  }, [editor]);

  const popupCharStylesEditorRef = useRef(null);

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink, setIsLinkEditMode]);

  const insertComment = () => {
    editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined);
  };

 const lockText = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
  
      const node = getSelectedNode(selection);
      if (!node || !$isReadOnlyTextNode(node)) return;
  
      const writable = node.getWritable();
      writable.__readonly = true;
  
      // Set contentEditable to false in DOM
      const dom = editor.getElementByKey(node.getKey());
      if (dom) {
        dom.setAttribute("contenteditable", "false");
        dom.classList.add("custom-text");
      }
  
      console.log("🔒 Locked ReadOnlyTextNode:", writable.__id);
    });
  };

  const unlockText = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
  
      const node = getSelectedNode(selection);
      if (!node || !$isReadOnlyTextNode(node)) return;
  
      const writable = node.getWritable();
      writable.__readonly = false;
  
      // Set contentEditable to false in DOM
      const dom = editor.getElementByKey(node.getKey());
      if (dom) {
        dom.setAttribute("contenteditable", "true");
        dom.classList.add("custom-text");
      }
  
      console.log("🔒 Locked ReadOnlyTextNode:", writable.__id);
    });
  };
  

  function mouseMoveListener(e) {
    if (
      popupCharStylesEditorRef?.current &&
      (e.buttons === 1 || e.buttons === 3)
    ) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== "none") {
        const elementUnderMouse = document.elementFromPoint(
          e.clientX,
          e.clientY
        );
        if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
          popupCharStylesEditorRef.current.style.pointerEvents = "none";
        }
      }
    }
  }

  function mouseUpListener() {
    if (popupCharStylesEditorRef?.current) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== "auto") {
        popupCharStylesEditorRef.current.style.pointerEvents = "auto";
      }
    }
  }

  useEffect(() => {
    if (popupCharStylesEditorRef?.current) {
      document.addEventListener("mousemove", mouseMoveListener);
      document.addEventListener("mouseup", mouseUpListener);

      return () => {
        document.removeEventListener("mousemove", mouseMoveListener);
        document.removeEventListener("mouseup", mouseUpListener);
      };
    }
  }, [popupCharStylesEditorRef]);

  const $updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();
    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = getDOMSelection(editor._window);

    if (popupCharStylesEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);
      setFloatingElemPosition(
        rangeRect,
        popupCharStylesEditorElem,
        anchorElem,
        isLink
      );
    }
  }, [editor, anchorElem, isLink]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;
    const update = () => {
      editor.getEditorState().read(() => {
        $updateTextFormatFloatingToolbar();
      });
    };

    window.addEventListener("resize", update);
    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);
      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [editor, $updateTextFormatFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateTextFormatFloatingToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateTextFormatFloatingToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, $updateTextFormatFloatingToolbar]);

  return (
    <div ref={popupCharStylesEditorRef} className="floating-text-format-popup">
      {editor.isEditable() && (
        <>
          <button
            type="button"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
            className={"popup-item spaced " + (isBold ? "active" : "")}
            title="Bold"
            aria-label="Format text as bold"
          >
            <i className="format bold" />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
            }
            className={"popup-item spaced " + (isItalic ? "active" : "")}
            title="Italic"
            aria-label="Format text as italics"
          >
            <i className="format italic" />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
            }
            className={"popup-item spaced " + (isUnderline ? "active" : "")}
            title="Underline"
            aria-label="Format text to underlined"
          >
            <i className="format underline" />
          </button>
          {/* <button
            type="button"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
            className={'popup-item spaced ' + (isStrikethrough ? 'active' : '')}
            title="Strikethrough"
            aria-label="Format text with a strikethrough">
            <i className="format strikethrough" />
          </button>
          <button
            type="button"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')}
            className={'popup-item spaced ' + (isSubscript ? 'active' : '')}
            title="Subscript"
            aria-label="Format Subscript">
            <i className="format subscript" />
          </button>
          <button
            type="button"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')}
            className={'popup-item spaced ' + (isSuperscript ? 'active' : '')}
            title="Superscript"
            aria-label="Format Superscript">
            <i className="format superscript" />
          </button> */}
          <button
            type="button"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "uppercase")
            }
            className={"popup-item spaced " + (isUppercase ? "active" : "")}
            title="Uppercase"
            aria-label="Format text to uppercase"
          >
            <i className="format uppercase" />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "lowercase")
            }
            className={"popup-item spaced " + (isLowercase ? "active" : "")}
            title="Lowercase"
            aria-label="Format text to lowercase"
          >
            <i className="format lowercase" />
          </button>
          {/* <button
            type="button"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'capitalize')}
            className={'popup-item spaced ' + (isCapitalize ? 'active' : '')}
            title="Capitalize"
            aria-label="Format text to capitalize">
            <i className="format capitalize" />
          </button> */}
          {/* <button
            type="button"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
            className={'popup-item spaced ' + (isCode ? 'active' : '')}
            title="Insert code block"
            aria-label="Insert code block">
            <i className="format code" />
          </button>
          <button
            type="button"
            onClick={insertLink}
            className={'popup-item spaced ' + (isLink ? 'active' : '')}
            title="Insert link"
            aria-label="Insert link">
            <i className="format link" />
          </button> */}
        </>
      )}
      <button
        type="button"
        onClick={insertComment}
        className={"popup-item spaced insert-comment"}
        title="Insert comment"
        aria-label="Insert comment"
      >
        <i className="format add-comment" />
      </button>
      <button
        type="button"
        onClick={lockText}
        className={"popup-item spaced insert-comment"}
        title="Lock Text"
        aria-label="Lock Text"
      >
        <LockKeyhole className="format h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={unlockText}
        className={"popup-item spaced insert-comment"}
        title="Unlock Text"
        aria-label="Unlock Text"
      >
        <LockKeyholeOpen className="format h-4 w-4" />
      </button>

    </div>
  );
}

function useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode) {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  const [isLowercase, setIsLowercase] = useState(false);
  const [isCapitalize, setIsCapitalize] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = getDOMSelection(editor._window);
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsUppercase(selection.hasFormat("uppercase"));
      setIsLowercase(selection.hasFormat("lowercase"));
      setIsCapitalize(selection.hasFormat("capitalize"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));

      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (
        !$isCodeHighlightNode(selection.anchor.getNode()) &&
        selection.getTextContent() !== ""
      ) {
        setIsText($isTextNode(node) || $isParagraphNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, "");
      if (!selection.isCollapsed() && rawTextContent === "") {
        setIsText(false);
        return;
      }
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener("selectionchange", updatePopup);
    return () => {
      document.removeEventListener("selectionchange", updatePopup);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      })
    );
  }, [editor, updatePopup]);

  if (!isText) {
    return null;
  }

  return createPortal(
    <TextFormatFloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isUppercase={isUppercase}
      isLowercase={isLowercase}
      isCapitalize={isCapitalize}
      isStrikethrough={isStrikethrough}
      isSubscript={isSubscript}
      isSuperscript={isSuperscript}
      isUnderline={isUnderline}
      isCode={isCode}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem
  );
}

export default function FloatingTextFormatToolbarPlugin({
  anchorElem = document.body,
  setIsLinkEditMode,
}) {
  const [editor] = useLexicalComposerContext();
  return useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode);
}
