import React, { useState } from 'react';


function Edit_Mode({ formFields, onDeleteField, onUpdateField, onUpdateOptions }) {
  const [newOption, setNewOption] = useState('');

  const handleLabelChange = (event, fieldId) => {
    onUpdateField(fieldId, event.target.value);
  };

  const handleAddOption = (fieldId) => {
    onUpdateOptions(fieldId, [...(formFields.find(field => field.id === fieldId)?.options || []), newOption]);
    setNewOption('');
  };

  const handleDeleteOption = (fieldId, optionIndex) => {
    const updatedOptions = formFields.find(field => field.id === fieldId).options.filter((_, index) => index !== optionIndex);
    onUpdateOptions(fieldId, updatedOptions);
  };

  return (
    <div className="edit-mode">
      <h3>Режим редактирования шаблона</h3>

      {formFields.map(field => (
        <div key={field.id} className="edit-field">
          <label>
            Метка:
            <input
              type="text"
              value={field.label || ''}
              onChange={(event) => handleLabelChange(event, field.id)}
            />
          </label>

          {field.type === 'select' && (
            <>
              <label>Варианты ответов:</label>
              <ul>
                {field.options?.map((option, index) => (
                  <li key={index}>
                    {option}
                    <button onClick={() => handleDeleteOption(field.id, index)}>Удалить</button>
                  </li>
                ))}
              </ul>
              <div>
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                />
                <button onClick={() => handleAddOption(field.id)}>Добавить вариант</button>
              </div>
            </>
          )}

          <button onClick={() => onDeleteField(field.id)}>Удалить</button>
        </div>
      ))}
    </div>
  );
}

export default Edit_Mode;