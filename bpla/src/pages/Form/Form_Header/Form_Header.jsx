import React from 'react';

function FormHeader({ templateTitle, formTitle, setFormTitle, toggleEditMode, isEditMode }) {
  return (
    <>
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
    </>
  );
}

export default FormHeader;