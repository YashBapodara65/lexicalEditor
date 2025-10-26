"use client";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { MarkNode } from "@lexical/mark";
import { OverflowNode } from "@lexical/overflow";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";

import { CollapsibleContainerNode } from "../plugins/CollapsiblePlugin/CollapsibleContainerNode";
import { CollapsibleContentNode } from "../plugins/CollapsiblePlugin/CollapsibleContentNode";
import { CollapsibleTitleNode } from "../plugins/CollapsiblePlugin/CollapsibleTitleNode";
import { AutocompleteNode } from "./AutocompleteNode";
import { DateTimeNode } from "./DateTimeNode/DateTimeNode";
import { EmojiNode } from "./EmojiNode";
import { EquationNode } from "./EquationNode";
import { ExcalidrawNode } from "./ExcalidrawNode";
import { FigmaNode } from "./FigmaNode";
import { ImageNode } from "./ImageNode";
import { KeywordNode } from "./KeywordNode";
import { LayoutContainerNode } from "./LayoutContainerNode";
import { LayoutItemNode } from "./LayoutItemNode";
import { MentionNode } from "./MentionNode";
import { PageBreakNode } from "./PageBreakNode";
import { PollNode } from "./PollNode";
import { SpecialTextNode } from "./SpecialTextNode";
import { StickyNode } from "./StickyNode";
import { TweetNode } from "./TweetNode";
import { YouTubeNode } from "./YouTubeNode";
import { FooterNode } from "./FooterNode";
import { DynamicNode } from "./DynamicNode";
import { HeaderNode } from "./HeaderNode";
import { TextImageNode } from "./TextImageNode";
import { ReadOnlyTextNode } from "./ReadOnlyTextNode";
import { TableBorderCellNode } from "./TableBorderCellNode";
import { CustomParagraph } from "./CustomParagraphNode";
import { ParagraphNode } from "lexical";

const PlaygroundNodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  TableNode,
  TableRowNode,
  HashtagNode,
  CodeHighlightNode,
  AutoLinkNode,
  LinkNode,
  OverflowNode,
  PollNode,
  StickyNode,
  ImageNode,
  MentionNode,
  EmojiNode,
  ExcalidrawNode,
  EquationNode,
  AutocompleteNode,
  KeywordNode,
  HorizontalRuleNode,
  TweetNode,
  YouTubeNode,
  FigmaNode,
  MarkNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
  PageBreakNode,
  LayoutContainerNode,
  LayoutItemNode,
  SpecialTextNode,
  DateTimeNode,
  ReadOnlyTextNode,
  TableBorderCellNode,
  CustomParagraph,
  // -------------------
  // Node replacements
  {
    replace: ParagraphNode,
    with: () => new CustomParagraph(),
    withKlass: CustomParagraph,
  },
  {
    replace: TableCellNode,
    with: function (node) {
      return new TableBorderCellNode(
        node.__headerState,
        node.__colSpan,
        node.__rowSpan,
        node.__style,
        node.__backgroundColor
      );
    },
    withKlass: TableBorderCellNode,
  },
];

export default PlaygroundNodes;
