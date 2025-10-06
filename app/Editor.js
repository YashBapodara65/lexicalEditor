import React, { useEffect, useMemo, useState } from "react";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CharacterLimitPlugin } from "@lexical/react/LexicalCharacterLimitPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { SelectionAlwaysOnDisplay } from "@lexical/react/LexicalSelectionAlwaysOnDisplay";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { CAN_USE_DOM } from "@lexical/utils";
import { useEffect as useEff } from "react";
import { Doc } from "yjs";

import {
  createWebsocketProvider,
  createWebsocketProviderWithDoc,
} from "./collaboration";
import { useSettings } from "./context/SettingsContext";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import ActionsPlugin from "./plugins/ActionsPlugin";
import AutocompletePlugin from "./plugins/AutocompletePlugin";
import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CodeActionMenuPlugin from "./plugins/CodeActionMenuPlugin";
import CodeHighlightPrismPlugin from "./plugins/CodeHighlightPrismPlugin";
import CodeHighlightShikiPlugin from "./plugins/CodeHighlightShikiPlugin";
import CollapsiblePlugin from "./plugins/CollapsiblePlugin";
import CommentPlugin from "./plugins/CommentPlugin";
import ComponentPickerPlugin from "./plugins/ComponentPickerPlugin";
import ContextMenuPlugin from "./plugins/ContextMenuPlugin";
import DateTimePlugin from "./plugins/DateTimePlugin";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import EmojiPickerPlugin from "./plugins/EmojiPickerPlugin";
import EmojisPlugin from "./plugins/EmojisPlugin";
import EquationsPlugin from "./plugins/EquationsPlugin";
import ExcalidrawPlugin from "./plugins/ExcalidrawPlugin";
import FigmaPlugin from "./plugins/FigmaPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import KeywordsPlugin from "./plugins/KeywordsPlugin";
import { LayoutPlugin } from "./plugins/LayoutPlugin/LayoutPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import MarkdownShortcutPlugin from "./plugins/MarkdownShortcutPlugin";
import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";
import MentionsPlugin from "./plugins/MentionsPlugin";
import PageBreakPlugin from "./plugins/PageBreakPlugin";
import PollPlugin from "./plugins/PollPlugin";
import ShortcutsPlugin from "./plugins/ShortcutsPlugin";
import SpecialTextPlugin from "./plugins/SpecialTextPlugin";
import SpeechToTextPlugin from "./plugins/SpeechToTextPlugin";
import TabFocusPlugin from "./plugins/TabFocusPlugin";
import TableCellActionMenuPlugin from "./plugins/TableActionMenuPlugin";
import TableCellResizer from "./plugins/TableCellResizer";
import TableHoverActionsPlugin from "./plugins/TableHoverActionsPlugin";
import TableOfContentsPlugin from "./plugins/TableOfContentsPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import TwitterPlugin from "./plugins/TwitterPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";
import ContentEditable from "./ui/ContentEditable";
import FooterPlugin from "./plugins/FooterPlugin";
import TwoFieldPlugin from "./plugins/BodyPlugin";

const skipCollaborationInit =
  // eslint-disable-next-line no-undef
  typeof window !== "undefined" &&
  // eslint-disable-next-line no-undef
  window.parent != null &&
  window.parent.frames &&
  window.parent.frames.right === window;

// A small example initial state that will preload the editor.
const initialJSON = null;

export default function Editor() {
  const { historyState } = useSharedHistoryContext();
  const {
    settings: {
      isCodeHighlighted,
      isCodeShiki,
      isCollab,
      useCollabV2,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      hasLinkAttributes,
      isCharLimitUtf8,
      isRichText,
      showTreeView,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      shouldPreserveNewLinesInMarkdown,
      tableCellMerge,
      tableCellBackgroundColor,
      tableHorizontalScroll,
      shouldAllowHighlightingWithBrackets,
      selectionAlwaysOnDisplay,
      listStrictIndent,
    },
  } = useSettings();

  const isEditable = useLexicalEditable();
  const placeholder = isCollab
    ? "Enter some collaborative rich text..."
    : isRichText
      ? "Enter some rich text..."
      : "Enter some plain text...";
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState(false);
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const [jsonPreview, setJsonPreview] = useState(() =>
    JSON.stringify(initialJSON, null, 2)
  );

  const onRef = (_floatingAnchorElem) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia("(max-width: 1025px)").matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener("resize", updateViewPortWidth);

    return () => {
      window.removeEventListener("resize", updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  useEffect(() => {
    if (!editor) return;

    try {
      editor.update(() => {
        const editorState = editor.parseEditorState(initialJSON);
        editor.setEditorState(editorState);
      });
    } catch (e) {
      console.warn("Failed to set initial JSON state:", e);
    }

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      const json = editorState.toJSON();
      setJsonPreview(JSON.stringify(json, null, 2));
    });

    return () => unregister();
  }, [editor]);

  const exportJSON = () => {
    const blob = new Blob([jsonPreview], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "editor-state.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {isRichText && (
        <ToolbarPlugin
          editor={editor}
          activeEditor={activeEditor}
          setActiveEditor={setActiveEditor}
          setIsLinkEditMode={setIsLinkEditMode}
        />
      )}
      {isRichText && (
        <ShortcutsPlugin
          editor={activeEditor}
          setIsLinkEditMode={setIsLinkEditMode}
        />
      )}
      <div
        className={`editor-container ${showTreeView ? "tree-view" : ""} ${
          !isRichText ? "plain-text" : ""
        }`}
      >
        {isMaxLength && <MaxLengthPlugin maxLength={30} />}
        <DragDropPaste />
        <AutoFocusPlugin />
        {selectionAlwaysOnDisplay && <SelectionAlwaysOnDisplay />}
        <ClearEditorPlugin />
        <ComponentPickerPlugin />
        <EmojiPickerPlugin />
        <AutoEmbedPlugin />
        <MentionsPlugin />
        <EmojisPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <SpeechToTextPlugin />
        <AutoLinkPlugin />
        <DateTimePlugin />
        <CommentPlugin
          providerFactory={isCollab ? createWebsocketProvider : undefined}
        />
        {isRichText ? (
          <>
            {isCollab ? (
              useCollabV2 ? (
                <CollabV2 id="main" shouldBootstrap={!skipCollaborationInit} />
              ) : (
                <CollaborationPlugin
                  id="main"
                  providerFactory={createWebsocketProvider}
                  shouldBootstrap={!skipCollaborationInit}
                />
              )
            ) : (
              <HistoryPlugin externalHistoryState={historyState} />
            )}
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor" ref={onRef}>
                    <ContentEditable placeholder={placeholder} />
                  </div>
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <MarkdownShortcutPlugin />
            {isCodeHighlighted &&
              (isCodeShiki ? (
                <CodeHighlightShikiPlugin />
              ) : (
                <CodeHighlightPrismPlugin />
              ))}
            <ListPlugin hasStrictIndent={listStrictIndent} />
            <CheckListPlugin />
            <TablePlugin
              hasCellMerge={tableCellMerge}
              hasCellBackgroundColor={tableCellBackgroundColor}
              hasHorizontalScroll={tableHorizontalScroll}
            />
            <TableCellResizer />
            <ImagesPlugin />
            <LinkPlugin hasLinkAttributes={hasLinkAttributes} />
            <PollPlugin />
            <TwitterPlugin />
            <YouTubePlugin />
            <FigmaPlugin />
            <ClickableLinkPlugin disabled={isEditable} />
            <HorizontalRulePlugin />
            <EquationsPlugin />
            <ExcalidrawPlugin />
            <TabFocusPlugin />
            <TabIndentationPlugin maxIndent={7} />
            <CollapsiblePlugin />
            <PageBreakPlugin />
            <LayoutPlugin />
            {floatingAnchorElem && (
              <>
                <FloatingLinkEditorPlugin
                  anchorElem={floatingAnchorElem}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
                <TableCellActionMenuPlugin
                  anchorElem={floatingAnchorElem}
                  cellMerge={true}
                />
              </>
            )}
            {floatingAnchorElem && !isSmallWidthViewport && (
              <>
                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                <TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
                <FloatingTextFormatToolbarPlugin
                  anchorElem={floatingAnchorElem}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
              </>
            )}
          </>
        ) : (
          <>
            <PlainTextPlugin
              contentEditable={<ContentEditable placeholder={placeholder} />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin externalHistoryState={historyState} />
          </>
        )}
        {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin
            charset={isCharLimit ? "UTF-16" : "UTF-8"}
            maxLength={5}
          />
        )}
        {isAutocomplete && <AutocompletePlugin />}
        <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
        {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
        {shouldAllowHighlightingWithBrackets && <SpecialTextPlugin />}
        <ActionsPlugin
          isRichText={isRichText}
          shouldPreserveNewLinesInMarkdown={shouldPreserveNewLinesInMarkdown}
        />
        <FooterPlugin />
        <TwoFieldPlugin />
      </div>
      {/* {showTreeView && <TreeViewPlugin />} */}

      {/* JSON Preview + Export */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Editor state (JSON)</h3>
          <div>
            <button onClick={exportJSON} style={{ marginRight: 8 }}>
              Export JSON
            </button>
            {/* You could also add a button to manually load JSON from textarea if you want */}
          </div>
        </div>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "black",
            padding: 12,
            borderRadius: 6,
            maxHeight: 400,
            overflow: "auto",
          }}
        >
          {jsonPreview}
        </pre>
      </div>
    </>
  );
}

function CollabV2({ id, shouldBootstrap }) {
  const doc = useMemo(() => new Doc(), []);

  const provider = useMemo(() => {
    return createWebsocketProviderWithDoc("main", doc);
  }, [doc]);

  return (
    <CollaborationPluginV2__EXPERIMENTAL
      id={id}
      doc={doc}
      provider={provider}
      __shouldBootstrapUnsafe={shouldBootstrap}
    />
  );
}
