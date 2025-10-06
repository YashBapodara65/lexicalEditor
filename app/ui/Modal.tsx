import * as React from 'react';
import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  onClose,
  children,
  title,
  closeOnClickOutside = false,
}: {
  children: ReactNode;
  closeOnClickOutside?: boolean;
  onClose: () => void;
  title: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) modalRef.current.focus();
  }, []);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const clickHandler = (event: MouseEvent) => {
      if (!modalRef.current) return;
      const target = event.target as Node;
      if (closeOnClickOutside && !modalRef.current.contains(target)) {
        onClose();
      }
    };

    window.addEventListener('keydown', keyHandler);
    window.addEventListener('mousedown', clickHandler);

    return () => {
      window.removeEventListener('keydown', keyHandler);
      window.removeEventListener('mousedown', clickHandler);
    };
  }, [closeOnClickOutside, onClose]);

  return createPortal(
    <div className="Modal__overlay" role="dialog">
      <div className="Modal__modal" tabIndex={-1} ref={modalRef}>
        <h2 className="Modal__title">{title}</h2>
        <button
          className="Modal__closeButton"
          aria-label="Close modal"
          type="button"
          onClick={onClose}
        >
          ✖
        </button>
        <div className="Modal__content">{children}</div>
      </div>
    </div>,
    document.body
  );
}
