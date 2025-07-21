import React from 'react';

/**
 * Simple modal for settings (minimal, for future expansion).
 * @param {object} props - open (bool), onClose (func), children
 */
 // PUBLIC_INTERFACE
function SettingsModal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="modal-mask" onClick={onClose}>
      <div
        className="modal-body"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">&times;</button>
        {children}
      </div>
    </div>
  );
}
export default SettingsModal;
