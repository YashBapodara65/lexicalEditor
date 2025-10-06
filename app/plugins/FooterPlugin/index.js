'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { useState } from 'react';
import { DialogActions, DialogButtonsList } from '../../ui/Dialog';
import TextInput from '../../ui/TextInput';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import { $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';

export default function FooterPlugin() {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);

  // Top section: single field dynamic
  const [topFields, setTopFields] = useState([{ value: '', style: 'color: #000000;', format: 0 }]);

  // Bottom section: two fields per row dynamic
  const [bottomFields, setBottomFields] = useState([
    { key: '', value: '', style: 'color: #000000;', format: 0 },
  ]);

  // --- Handlers ---
  const handleTopChange = (index, value, style, format) => {
    const newFields = [...topFields];
    newFields[index] = { value, style, format };
    setTopFields(newFields);
  };

  const handleBottomChange = (index, key, value, style, format) => {
    const newFields = [...bottomFields];
    newFields[index] = { key, value, style, format };
    setBottomFields(newFields);
  };

  const addTopField = () =>
    setTopFields([...topFields, { value: '', style: 'color: #000000;', format: 0 }]);
  const addBottomField = () =>
    setBottomFields([...bottomFields, { key: '', value: '', style: 'color: #000000;', format: 0 }]);

  // --- Submit to Lexical Editor ---
  const submitNode = () => {
    const validTop = topFields.filter(f => f.value.trim() !== '');
    const validBottom = bottomFields.filter(f => f.value.trim() !== '');

    if (!validTop.length && !validBottom.length) return;

    editor.update(() => {
      const root = $getRoot();
    
      // Remove empty paragraphs
      root.getChildren().forEach(node => {
        if (node.getType() === 'paragraph' && node.getTextContent().trim() === '') {
          node.remove();
        }
      });
    
      // --- Add Top Fields with justify-between ---
      for (let i = 0; i < validTop.length; i += 2) {
        const left = validTop[i]?.value || '';
        const right = validTop[i + 1]?.value || '';
    
        const p = $createParagraphNode();
        p.setFormat(0); // optional: plain paragraph
    
        const textNode = $createTextNode(left + '\t' + right); // placeholder, styling will adjust spacing
        if (validTop[i].style) textNode.setStyle(validTop[i].style);
        if (validTop[i].format) textNode.setFormat(validTop[i].format);
    
        p.append(textNode);
    
        // Add flex justify-between using CSS class
        p.setStyle('display: flex; justify-content: space-between;');
        root.append(p);
      }
    
      // --- Horizontal rule ---
      if (validTop.length && validBottom.length) {
        const hr = $createHorizontalRuleNode();
        root.append(hr);
      }
    
      // --- Add Bottom Fields (unchanged) ---
      validBottom.forEach(f => {
        const p = $createParagraphNode();
        const textNode = $createTextNode(f.key ? `${f.key}: ${f.value}` : f.value);
        if (f.style) textNode.setStyle(f.style);
        if (f.format) textNode.setFormat(f.format);
        p.append(textNode);
        root.append(p);
      });
    });
    

    setTopFields([{ value: '', style: 'color: #000000;', format: 0 }]);
    setBottomFields([{ key: '', value: '', style: 'color: #000000;', format: 0 }]);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Footer Fields</Button>

      {open && (
        <Modal title="Add Footer Fields" onClose={() => setOpen(false)} closeOnClickOutside={true}>
          <div className="DialogContent">
            {/* --- Top Section --- */}
            <h3>Top Section</h3>
            {topFields.map((field, i) => (
              <div key={i} className="DialogFieldRow">
                <TextInput
                  label={`Field ${i + 1}`}
                  placeholder="Enter text..."
                  value={field.value}
                  onChange={val => handleTopChange(i, val, field.style, field.format)}
                />
              </div>
            ))}
            <Button onClick={addTopField}>+ Add Field</Button>

            {/* --- Bottom Section --- */}
            <h3>Bottom Section</h3>
            {bottomFields.map((field, i) => (
              <div key={i} className="DialogFieldRow" style={{ display: 'flex', gap: '8px' }}>
                <TextInput
                  label="Key"
                  placeholder="Enter key..."
                  value={field.key}
                  onChange={val => handleBottomChange(i, val, field.value, field.style, field.format)}
                />
                <TextInput
                  label="Value"
                  placeholder="Enter value..."
                  value={field.value}
                  onChange={val => handleBottomChange(i, field.key, val, field.style, field.format)}
                />
              </div>
            ))}
            <Button onClick={addBottomField}>+ Add Field</Button>

            {/* --- Live Render Preview --- */}
            <div className="DialogPreview" style={{ marginTop: '16px', border: '1px dashed #ccc', padding: '8px' }}>
              <strong>Preview:</strong>
              <div>
                {topFields.map((f, idx) => (
                  <p
                    key={`top-${idx}`}
                    style={{
                      ...parseStyle(f.style),
                      fontWeight: f.format === 1 ? 'bold' : 'normal',
                      fontStyle: f.format === 2 ? 'italic' : 'normal',
                      textDecoration: f.format === 3 ? 'underline' : 'none',
                      margin: '2px 0',
                    }}
                  >
                    {f.value || '...'}
                  </p>
                ))}
              </div>

              {topFields.length && bottomFields.length ? <hr /> : null}

              <div>
                {bottomFields.map((f, idx) => (
                  <p
                    key={`bottom-${idx}`}
                    style={{
                      ...parseStyle(f.style),
                      fontWeight: f.format === 1 ? 'bold' : 'normal',
                      fontStyle: f.format === 2 ? 'italic' : 'normal',
                      textDecoration: f.format === 3 ? 'underline' : 'none',
                      margin: '2px 0',
                    }}
                  >
                    {f.key ? `${f.key}: ${f.value}` : f.value || '...'}
                  </p>
                ))}
              </div>
            </div>

            <DialogActions>
              <DialogButtonsList>
                <Button onClick={() => setOpen(false)} className="Cancel">
                  Cancel
                </Button>
                <Button onClick={submitNode} className="Submit">
                  Submit
                </Button>
              </DialogButtonsList>
            </DialogActions>
          </div>
        </Modal>
      )}
    </>
  );
}

// Convert inline CSS → React style
function parseStyle(styleString) {
  if (!styleString) return {};
  return styleString.split(';').reduce((acc, item) => {
    if (!item.trim()) return acc;
    const [key, value] = item.split(':');
    acc[key.trim()] = value.trim();
    return acc;
  }, {});
}
