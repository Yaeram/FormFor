import React from 'react';
import './FormHeader.css'

function FormHeader({ templateTitle, formTitle, setFormTitle, toggleEditMode, isEditMode }) {
  return (
    <div className='form-header'>
      <button onClick={toggleEditMode}>
        {isEditMode ? 'Выключить режим редактирования' : 'Включить режим редактирования'}
      </button>
      <label>
        Название анкеты:
        <input
          type="text"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
        />
      </label>
      <h3>{templateTitle}</h3>
    </div>
  );
}

export default FormHeader;