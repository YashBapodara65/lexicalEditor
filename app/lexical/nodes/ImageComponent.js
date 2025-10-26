"use client";

import "./ImageNode.css";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useCollaborationContext } from "@lexical/react/LexicalCollaborationContext";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import * as React from "react";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createWebsocketProvider } from "../collaboration";
import { useSettings } from "../context/SettingsContext";
import { useSharedHistoryContext } from "../context/SharedHistoryContext";
import brokenImage from "../images/image-broken.svg";
import EmojisPlugin from "../plugins/EmojisPlugin";
import KeywordsPlugin from "../plugins/KeywordsPlugin";
import LinkPlugin from "../plugins/LinkPlugin";
import MentionsPlugin from "../plugins/MentionsPlugin";
import TreeViewPlugin from "../plugins/TreeViewPlugin";
import ContentEditable from "../ui/ContentEditable";
import ImageResizer from "../ui/ImageResizer";
import { $isImageNode } from "./ImageNode";
import Image from "next/image";

const imageCache = new Map();

export const RIGHT_CLICK_IMAGE_COMMAND = createCommand(
  "RIGHT_CLICK_IMAGE_COMMAND"
);

function useSuspenseImage(src) {
  let cached = imageCache.get(src);
  if (cached && "error" in cached) {
    return cached;
  } else if (!cached) {
    cached = new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () =>
        resolve({
          error: false,
          height: img.naturalHeight,
          width: img.naturalWidth,
        });
      img.onerror = () => resolve({ error: true });
    }).then((rval) => {
      imageCache.set(src, rval);
      return rval;
    });
    imageCache.set(src, cached);
    throw cached;
  }
  throw cached;
}

function isSVG(src) {
  if (typeof src !== "string") return false;
  return src.toLowerCase().endsWith(".svg");
}

function LazyImage({
  src,
  altText,
  imageRef,
  className,
  width,
  height,
  maxWidth,
  onError,
}) {
  const [hasError, setHasError] = useState(false);

  const style = {
    width: width === "inherit" ? "auto" : width,
    height: height === "inherit" ? "auto" : height,
    maxWidth,
  };

  if (hasError) {
    return (
      <img
        src={brokenImage}
        alt="Broken image"
        style={{ width: 200, height: 200, opacity: 0.3 }}
      />
    );
  }

  return (
    <img
      ref={imageRef}
      src={src}
      alt={altText}
      style={style}
      className={className}
      onError={() => {
        setHasError(true);
        onError?.();
      }}
      draggable={false}
    />
  );
}

function BrokenImage() {
  return (
    <Image
      width={200}
      height={200}
      alt="Broken image"
      src={brokenImage}
      style={{ height: 200, width: 200, opacity: 0.2 }}
      draggable={false}
      unoptimized
    />
  );
}

function noop() {}

export default function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  resizable,
  showCaption,
  caption,
  captionsEnabled,
}) {
  const imageRef = useRef(null);
  const buttonRef = useRef(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState(false);
  const { isCollabActive } = useCollaborationContext();
  const [editor] = useLexicalComposerContext();
  const activeEditorRef = useRef(null);
  const [isLoadError, setIsLoadError] = useState(false);
  const isEditable = useLexicalEditable();
  const isInNodeSelection = useMemo(() => {
    return (
      isSelected &&
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        return $isNodeSelection(selection) && selection.has(nodeKey);
      })
    );
  }, [editor, isSelected, nodeKey]);

  const $onEnter = useCallback(
    (event) => {
      const latestSelection = $getSelection();
      const buttonElem = buttonRef.current;
      if (
        $isNodeSelection(latestSelection) &&
        latestSelection.has(nodeKey) &&
        latestSelection.getNodes().length === 1
      ) {
        if (showCaption) {
          $setSelection(null);
          event.preventDefault();
          caption.focus();
          return true;
        } else if (
          buttonElem !== null &&
          buttonElem !== document.activeElement
        ) {
          event.preventDefault();
          buttonElem.focus();
          return true;
        }
      }
      return false;
    },
    [caption, nodeKey, showCaption]
  );

  const $onEscape = useCallback(
    (event) => {
      if (
        activeEditorRef.current === caption ||
        buttonRef.current === event.target
      ) {
        $setSelection(null);
        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();
          if (parentRootElement !== null) {
            parentRootElement.focus();
          }
        });
        return true;
      }
      return false;
    },
    [caption, editor, setSelected]
  );

  const onClick = useCallback(
    (payload) => {
      if (isResizing) return true;
      if (payload.target === imageRef.current) {
        if (payload.shiftKey) setSelected(!isSelected);
        else {
          clearSelection();
          setSelected(true);
        }
        return true;
      }
      return false;
    },
    [isResizing, isSelected, setSelected, clearSelection]
  );

  const onRightClick = useCallback(
    (event) => {
      editor.getEditorState().read(() => {
        const latestSelection = $getSelection();
        const domElement = event.target;
        if (
          domElement.tagName === "IMG" &&
          $isRangeSelection(latestSelection) &&
          latestSelection.getNodes().length === 1
        ) {
          editor.dispatchCommand(RIGHT_CLICK_IMAGE_COMMAND, event);
        }
      });
    },
    [editor]
  );

function getPrevImageNode(node, anchorOffset) {
  if (!node) return null;

  // If the node is an image itself
  if ($isImageNode(node)) return node;

  // If it's a paragraph or table cell, check children
  const children = node.getChildren?.();
  if (!children || children.length === 0) return null;

  // Start from the child just before the cursor
  let startIndex = children.length - 1;
  if (typeof anchorOffset === "number" && anchorOffset > 0) {
    startIndex = Math.min(anchorOffset - 1, children.length - 1);
  }

  for (let i = startIndex; i >= 0; i--) {
    const child = children[i];

    if ($isImageNode(child)) return child;

    // Recursive search inside child
    const nested = getPrevImageNode(child);
    if (nested) return nested;
  }

  return null;
}

  useEffect(() => {
    return mergeRegister(
     editor.registerCommand(
  KEY_BACKSPACE_COMMAND,
  (event) => {
    return editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return false;

      const anchorNode = selection.anchor.getNode();
      const anchorOffset = selection.anchor.offset;

      const prevImageNode = getPrevImageNode(anchorNode, anchorOffset);

      if (prevImageNode && prevImageNode.isReadonly?.()) {
        // Prevent native deletion
        if (event?.preventDefault) event.preventDefault();
        return true; // stop Lexical from removing the node
      }

      return false;
    });
  },
  COMMAND_PRIORITY_HIGH
),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        () => {
          return editor.getEditorState().read(() => {
            const selection = $getSelection();

            // ✅ Case 1: Selected image
            const selectedNode = selection?.getNodes?.()[0];
            if (
              selectedNode &&
              $isImageNode(selectedNode) &&
              selectedNode.isReadonly?.()
            ) {
              console.log("⛔ Prevented deletion of selected readonly image");
              return true;
            }

            // ✅ Case 2: Cursor next to image
            if ($isRangeSelection(selection)) {
              const anchorNode = selection.anchor.getNode();
              let target = anchorNode.getNextSibling();
              if (!target && anchorNode.getParent()) {
                target = anchorNode.getParent().getNextSibling();
              }
              if (target && $isImageNode(target) && target.isReadonly?.()) {
                console.log("⛔ Prevented deletion of readonly image (Delete)");
                return true;
              }
            }

            return false;
          });
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  useEffect(() => {
    let rootCleanup = noop;
    return mergeRegister(
      editor.registerCommand(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        RIGHT_CLICK_IMAGE_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        $onEscape,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerRootListener((rootElement) => {
        rootCleanup();
        rootCleanup = noop;
        if (rootElement) {
          rootElement.addEventListener("contextmenu", onRightClick);
          rootCleanup = () =>
            rootElement.removeEventListener("contextmenu", onRightClick);
        }
      }),
      () => rootCleanup()
    );
  }, [editor, $onEnter, $onEscape, onClick, onRightClick]);

  const setShowCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setShowCaption(true);
      }
    });
  };

  const onResizeEnd = (nextWidth, nextHeight) => {
    setIsResizing(false);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndHeight(nextWidth, nextHeight);
      }
    });
  };

  const onResizeStart = () => setIsResizing(true);

  const { historyState } = useSharedHistoryContext();
  const {
    settings: { showNestedEditorTreeView },
  } = useSettings();

  const isReadonly = useMemo(() => {
    let readonly = false;
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        readonly = node.isReadonly();
      }
    });
    return readonly;
  }, [editor, nodeKey]);

  // Disable dragging & selecting if readonly
  const draggable = isInNodeSelection && !isResizing && !isReadonly;
  const isFocused = (isSelected || isResizing) && isEditable;

  return (
    <Suspense fallback={null}>
      <>
        <div draggable={draggable}>
          {isLoadError ? (
            <BrokenImage />
          ) : (
            <LazyImage
              className={
                isFocused
                  ? `focused ${isInNodeSelection ? "draggable" : ""}`
                  : null
              }
              src={src}
              altText={altText}
              imageRef={imageRef}
              width={width}
              height={height}
              maxWidth={maxWidth}
              onError={() => setIsLoadError(true)}
            />
          )}
        </div>

        {showCaption && (
          <div className="image-caption-container">
            <LexicalNestedComposer initialEditor={caption}>
              <AutoFocusPlugin />
              <MentionsPlugin />
              <LinkPlugin />
              <EmojisPlugin />
              <HashtagPlugin />
              <KeywordsPlugin />
              {isCollabActive ? (
                <CollaborationPlugin
                  id={caption.getKey()}
                  providerFactory={createWebsocketProvider}
                  shouldBootstrap={true}
                />
              ) : (
                <HistoryPlugin externalHistoryState={historyState} />
              )}
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    placeholder="Enter a caption..."
                    placeholderClassName="ImageNode__placeholder"
                    className="ImageNode__contentEditable"
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              {showNestedEditorTreeView ? <TreeViewPlugin /> : null}
            </LexicalNestedComposer>
          </div>
        )}

        {resizable && isInNodeSelection && isFocused && (
          <ImageResizer
            showCaption={showCaption}
            setShowCaption={setShowCaption}
            editor={editor}
            buttonRef={buttonRef}
            imageRef={imageRef}
            nodeKey={nodeKey}
            maxWidth={maxWidth}
            onResizeStart={onResizeStart}
            onResizeEnd={onResizeEnd}
            captionsEnabled={!isLoadError && captionsEnabled}
          />
        )}
      </>
    </Suspense>
  );
}
