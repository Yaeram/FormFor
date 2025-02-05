import React from 'react';
import './Confirmation_Dialog.css';

function Confirmation_Dialog({ isOpen, message, onConfirm }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirmation-dialog-overlay">
      <div className="confirmation-dialog">
        <p>{message}</p>
        <div className="confirmation-buttons">
          <button onClick={() => onConfirm(true)}>Да</button>
          <button onClick={() => onConfirm(false)}>Нет</button>
        </div>
      </div>
    </div>
  );
}

export default Confirmation_Dialog;