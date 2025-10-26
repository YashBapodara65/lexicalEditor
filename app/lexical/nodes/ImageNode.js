import { HashtagNode } from "@lexical/hashtag";
import { LinkNode } from "@lexical/link";
import {
  $applyNodeReplacement,
  createEditor,
  DecoratorNode,
  LineBreakNode,
  ParagraphNode,
  RootNode,
  TextNode,
} from "lexical";
import * as React from "react";
import { v4 as uuidv4 } from "uuid"; // npm install uuid

import { EmojiNode } from "./EmojiNode";
import { KeywordNode } from "./KeywordNode";

const ImageComponent = React.lazy(() => import("./ImageComponent"));

function isGoogleDocCheckboxImg(img) {
  return (
    img.parentElement != null &&
    img.parentElement.tagName === "LI" &&
    img.previousSibling === null &&
    img.getAttribute("aria-roledescription") === "checkbox"
  );
}

function $convertImageElement(domNode) {
  const img = domNode;
  if (img.src.startsWith("file:///") || isGoogleDocCheckboxImg(img)) {
    return null;
  }
  const { alt: altText, src, width, height } = img;
  const node = $createImageNode({ altText, height, src, width });
  return { node };
}

export class ImageNode extends DecoratorNode {
  constructor(
    src,
    altText,
    maxWidth,
    width,
    height,
    showCaption,
    caption,
    captionsEnabled,
    key,
    id,
    readonly
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width || "inherit";
    this.__height = height || "inherit";
    this.__showCaption = showCaption || false;
    this.__caption =
      caption ||
      createEditor({
        namespace: "Playground/ImageNodeCaption",
        nodes: [
          RootNode,
          TextNode,
          LineBreakNode,
          ParagraphNode,
          LinkNode,
          EmojiNode,
          HashtagNode,
          KeywordNode,
        ],
      });
    this.__captionsEnabled = captionsEnabled ?? true;

    // Extra fields
    this.__id = id || uuidv4();
    this.__readonly = readonly ?? false;
  }

  static getType() {
    return "image";
  }

  // Getter methods
  getId() {
    return this.__id;
  }

  isReadonly() {
    return this.__readonly;
  }

  setReadonly(value) {
    const writable = this.getWritable();
    writable.__readonly = value;
  }

  static clone(node) {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__captionsEnabled,
      node.__key,
      node.__id,
      node.__readonly
    );
  }

  static importJSON(serializedNode) {
    const { altText, height, width, maxWidth, src, showCaption, id, readonly } =
      serializedNode;
    return $createImageNode({
      altText,
      height,
      maxWidth,
      showCaption,
      src,
      width,
      id,
      readonly,
    }).updateFromJSON(serializedNode);
  }

  updateFromJSON(serializedNode) {
    const node = super.updateFromJSON(serializedNode);
    const { caption } = serializedNode;

    const nestedEditor = node.__caption;
    const editorState = nestedEditor.parseEditorState(caption.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return node;
  }

  exportDOM() {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    element.setAttribute("width", this.__width.toString());
    element.setAttribute("height", this.__height.toString());
    return { element };
  }

  static importDOM() {
    return {
      img: (node) => ({
        conversion: $convertImageElement,
        priority: 0,
      }),
    };
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      altText: this.getAltText(),
      caption: this.__caption.toJSON(),
      height: this.__height === "inherit" ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      width: this.__width === "inherit" ? 0 : this.__width,
      id: this.__id,
      readonly: this.__readonly,
    };
  }

  setWidthAndHeight(width, height) {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setShowCaption(showCaption) {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
  }

  createDOM(config) {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM() {
    return false;
  }

  getSrc() {
    return this.__src;
  }

  getAltText() {
    return this.__altText;
  }

  decorate() {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        maxWidth={this.__maxWidth}
        nodeKey={this.getKey()}
        resizable={true}
        showCaption={this.__showCaption}
        caption={this.__caption}
        captionsEnabled={this.__captionsEnabled}
      />
    );
  }
}

export function $createImageNode({
  altText,
  height,
  maxWidth = 500,
  captionsEnabled,
  src,
  width,
  showCaption,
  caption,
  key,
  id,
  readonly
}) {
  return $applyNodeReplacement(
    new ImageNode(
      src,
      altText,
      maxWidth,
      width,
      height,
      showCaption,
      caption,
      captionsEnabled,
      key,
      id,
      readonly
    )
  );
}

export function $isImageNode(node) {
  return node instanceof ImageNode;
}
