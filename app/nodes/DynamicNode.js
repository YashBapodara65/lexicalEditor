import { DecoratorNode } from 'lexical';

export class DynamicNode extends DecoratorNode {
  constructor(fields = [], key) {
    super(key);
    this.fields = fields;          // store dynamic fields
    this.renderComponent = null;   // plugin provides preview rendering
  }

  static getType() {
    return 'dynamic';
  }

  static clone(node) {
    const cloned = new DynamicNode([...node.fields], node.__key);
    cloned.renderComponent = node.renderComponent;
    return cloned;
  }

  exportJSON() {
    return {
      type: 'dynamic',
      version: 1,
      fields: this.fields,
    };
  }

  createDOM() {
    const div = document.createElement('div');
    div.style.marginBottom = '4px';
    return div;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    // Render the component provided by the plugin
    return this.renderComponent || null;
  }

  static create(fields = []) {
    return new DynamicNode(fields);
  }

  // Update field data
  updateField(index, newKey, newValue) {
    if (index < 0 || index >= this.fields.length) return;
    const field = this.fields[index];
    field.key = newKey !== undefined ? newKey : field.key;
    field.value = newValue !== undefined ? newValue : field.value;
  }

  // Add new field data
  addField(key = '', value = '') {
    this.fields.push({ key, value });
  }
}
