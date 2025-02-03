import React from 'react';
import './FormPreview.css';

function FormPreview({ formFields, onDeleteField }) {
  return (
    <div className="form-preview">
      <h2>Предварительный просмотр анкеты:</h2>
      {formFields.map((field) => (
        <div key={field.id} className="form-field-preview">
           <label>{field.label}:</label>
           {field.type === 'text' && <input type="text" />}
           {field.type === 'select' && (
              <select>
                 {field.options.map((option, index) => (
                    <option key={index}>{option}</option>
                 ))}
              </select>
           )}
           <button onClick={() => onDeleteField(field.id)}>Удалить</button>
        </div>
      ))}
    </div>
  );
}

export default FormPreview;