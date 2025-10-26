import './FlashMessage.css';
import * as React from 'react';
import { createPortal } from 'react-dom';

export default function FlashMessage({ children }) {
  return createPortal(
    <div className="FlashMessage__overlay" role="dialog">
      <p className="FlashMessage__alert" role="alert">
        {children}
      </p>
    </div>,
    document.body,
  );
}
