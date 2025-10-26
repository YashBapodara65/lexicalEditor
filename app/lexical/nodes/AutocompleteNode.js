import { TextNode } from "lexical";
import { uuid as UUID } from "../plugins/AutocompletePlugin";

export class AutocompleteNode extends TextNode {
  /**
   * A unique uuid is generated for each session and assigned to the instance.
   * This helps to:
   * - Ensures max one Autocomplete node per session.
   * - Ensure that when collaboration is enabled, this node is not shown in
   *   other sessions.
   */
  constructor(text, uuid, key) {
    super(text, key);
    this.__uuid = uuid;
  }

  static clone(node) {
    return new AutocompleteNode(node.__text, node.__uuid, node.__key);
  }

  static getType() {
    return "autocomplete";
  }

  static importDOM() {
    // Never import from DOM
    return null;
  }

  static importJSON(serializedNode) {
    return $createAutocompleteNode(
      serializedNode.text,
      serializedNode.uuid
    ).updateFromJSON(serializedNode);
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      uuid: this.__uuid,
    };
  }

  updateDOM(prevNode, dom, config) {
    return false;
  }

  exportDOM() {
    return { element: null };
  }

  excludeFromCopy() {
    return true;
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    dom.classList.add(config.theme.autocomplete);
    if (this.__uuid !== UUID) {
      dom.style.display = "none";
    }
    return dom;
  }
}

export function $createAutocompleteNode(text, uuid) {
  return new AutocompleteNode(text, uuid).setMode("token");
}
