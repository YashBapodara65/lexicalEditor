'use client';
import { DecoratorNode } from 'lexical';
import Image from 'next/image';
import React from 'react';

// -------------------- Node --------------------
export class TextImageNode extends DecoratorNode {
  __fields;
  __image;

  static getType() {
    return 'text-image-node';
  }

  static clone(node) {
    return new TextImageNode([...node.__fields], node.__image, node.__key);
  }

  constructor(fields = [], image = '', key) {
    super(key);
    this.__fields = fields;
    this.__image = image;
  }

  // JSON export
  exportJSON() {
    return {
      type: 'text-image-node',
      version: 1,
      fields: this.__fields,
      image: this.__image,
    };
  }

  // JSON import
  static importJSON(serializedNode) {
    return new TextImageNode(serializedNode.fields || [], serializedNode.image || '');
  }

  createDOM() {
    const div = document.createElement('div');
    div.style.width = '100%';
    return div;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return <TextImageComponent fields={this.__fields} image={this.__image} />;
  }
}

// -------------------- Helpers --------------------
export function $createTextImageNode(fields = [], image = '') {
  return new TextImageNode(fields, image);
}

export function $isTextImageNode(node) {
  return node instanceof TextImageNode;
}

// -------------------- React Component --------------------
function TextImageComponent({ fields, image }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        border: '1px solid #ccc',
        padding: '12px',
        margin: '8px 0',
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box',
      }}
      contentEditable={false} // prevent Lexical editor from editing the layout
    >
      {/* Fields */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {fields.map((f, i) => (
          <p
            key={i}
            style={{
              margin: 0,
              color: f.style?.color || '#000',
              wordBreak: 'break-word',
            }}
          >
            {i === 0 ? `${f.value}:` : ` ${f.value}`}
          </p>
        ))}
      </div>

      {/* Image */}
      {image && (
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <Image
            src={image}
            alt="text-image-node"
            width={200}
            height={100}
            style={{ borderRadius: 4, objectFit: 'contain' }}
            unoptimized // allows external URLs without next.config.js
          />
        </div>
      )}
    </div>
  );
}
