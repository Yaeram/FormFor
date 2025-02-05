import React from 'react';

function FormField({ field, handleInputChange }) {
  return (
    <div className="form-field">
      <label>{field.label}:</label>
      {field.type === 'text' && (
        <input
          type="text"
          value={field.value || ''}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
        />
      )}
      {field.type === 'select' && (
        <select
          value={field.value || ''}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
        >
          <option value="">Выберите...</option>
          {field.options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      )}
    </div>
  );
}

export default FormField;