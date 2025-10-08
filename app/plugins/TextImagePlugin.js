'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';
import { DialogActions, DialogButtonsList } from '../ui/Dialog';
import { $createTextImageNode } from '../nodes/TextImageNode';

export default function TextImagePlugin() {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);

  const [fields, setFields] = useState([
    { value: '', style: 'color: #000000;', format: 0 },
    { value: '', style: 'color: #000000;', format: 0 },
  ]);

  const [imageUrl, setImageUrl] = useState('');

  const handleFieldChange = (index, value) => {
    const newFields = [...fields];
    newFields[index].value = value;
    setFields(newFields);
  };

  const addField = () => setFields([...fields, { value: '', style: 'color: #000000;', format: 0 }]);
  const addTwoFields = () =>
    setFields([...fields, { value: '', style: 'color: #000000;', format: 0 }, { value: '', style: 'color: #000000;', format: 0 }]);

  const submitNode = () => {
    const validFields = fields.filter(f => f.value.trim() !== '');
    if (!validFields.length && !imageUrl.trim()) return;
  
    const currentFields = [...validFields];
    const currentImage = imageUrl;
  
editor.update(() => {
  const root = $getRoot();
  const node = $createTextImageNode(validFields, imageUrl || '');
  root.append(node); // append directly
});

  
    // Reset
    setFields([
      { value: '', style: 'color: #000000;', format: 0 },
      { value: '', style: 'color: #000000;', format: 0 },
    ]);
    setImageUrl('');
    setOpen(false);
  };
  

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Text & Image</Button>

      {open && (
        <Modal title="Add Text & Image" onClose={() => setOpen(false)} closeOnClickOutside={true}>
          <div className="DialogContent">
            <h3>Text Fields</h3>
            {fields.map((field, i) => (
              <div key={i} className="DialogFieldRow">
                <TextInput label={`Field ${i + 1}`} placeholder="Enter text..." value={field.value} onChange={val => handleFieldChange(i, val)} />
              </div>
            ))}

            <div style={{ display: 'flex', gap: '8px', margin: '10px 0' }}>
              <Button onClick={addField}>+ Add Field</Button>
              <Button onClick={addTwoFields}>+ Add 2 Fields</Button>
            </div>

            <h3>Image URL</h3>
            <TextInput placeholder="https://example.com/image.jpg" value={imageUrl} onChange={setImageUrl} />

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
