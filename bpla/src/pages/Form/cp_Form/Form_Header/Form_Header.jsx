import React from 'react';
import './FormHeader.css'

function FormHeader({ templateTitle, formTitle, setFormTitle, toggleEditMode, isEditMode }) {
  return (
    <div className='form-header'>
      <h2>{templateTitle}</h2>
      <label>
        Название анкеты:
        <input
          type="text"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
        />
      </label>
      <button onClick={toggleEditMode}>
        {isEditMode ? 'Выключить режим редактирования' : 'Включить режим редактирования'}
      </button>
    </div>
  );
}

export default FormHeader;