import React from 'react';
import './Confirmation_Dialog.css';

function ConfirmationDialog({ isOpen, message, onConfirm, onClose }) {
  if (!isOpen) {
      return null;
  }

  return (
      <div className="confirmation-dialog-overlay">
          <div className="confirmation-dialog">
              <p>{message}</p>
              <div className="confirmation-buttons">
                  <button onClick={onConfirm}>Да</button>
                  <button onClick={onClose}>Нет</button>
              </div>
          </div>
      </div>
  );
}

export default ConfirmationDialog;