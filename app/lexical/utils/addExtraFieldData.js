// utils/addExtraFieldData.js
export function addExtraFieldToLexicalJSON(node, type, extraFieldName, extraFieldValue) {
  if (!node) return;

  if (node.type === type) {
    node[extraFieldName] = extraFieldValue;
  }

  // Correct recursive call — pass all 4 parameters
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => 
      addExtraFieldToLexicalJSON(child, type, extraFieldName, extraFieldValue)
    );
  }
}
