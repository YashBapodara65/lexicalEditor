'use client';
import { DecoratorNode } from 'lexical';
import React from 'react';

export class FooterNode extends DecoratorNode {
  __fields;
  __image;
  __children; // store children explicitly

  static getType() {
    return 'footer-node';
  }

  static clone(node) {
    return new FooterNode([...node.__fields], node.__image, [...(node.__children || [])], node.__key);
  }

  constructor(fields = [], image = null, children = [], key) {
    super(key);
    this.__fields = fields;
    this.__image = image;
    this.__children = children;
  }

  exportJSON() {
    return {
      type: 'footer-node',
      version: 1,
      fields: this.__fields,
      image: this.__image,
      children: this.__children || []
    };
  }

  static importJSON(serializedNode) {
    return new FooterNode(
      serializedNode.fields || [],
      serializedNode.image || null,
      serializedNode.children || []
    );
  }

  createDOM() {
    return document.createElement('div');
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return <FooterComponent fields={this.__fields} image={this.__image} />;
  }
}

export function $createFooterNode(fields, image, children = []) {
  return new FooterNode(fields, image, children);
}

export function $isFooterNode(node) {
  return node instanceof FooterNode;
}

// Optional rendering
function FooterComponent({ fields, image }) {
  return (
    <div style={{ borderTop: '1px solid #ccc', marginTop: '20px', padding: '12px' }}>
      <div style={{ marginBottom: '12px' }}>
        {fields.map((f, i) => (
          <p key={i} style={parseStyle(f.style)}>
            {i % 2 === 0 ? `${f.value}:` : ` ${f.value}`}
          </p>
        ))}
      </div>
      {image && (
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <img src={image} alt="footer" style={{ maxWidth: '200px', borderRadius: '4px' }} />
        </div>
      )}
    </div>
  );
}

function parseStyle(styleString) {
  if (!styleString) return {};
  return styleString.split(';').reduce((acc, item) => {
    if (!item.trim()) return acc;
    const [key, value] = item.split(':');
    acc[key.trim()] = value.trim();
    return acc;
  }, {});
}
