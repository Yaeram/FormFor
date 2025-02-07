import React from 'react';
import Form_Field from '../Form_Field/Form_Field';

function DisplayModeSection({ formData, handleInputChange }) {
  return (
      <div className="display-mode-section">
          {formData && formData.map(field => (
              <div key={field.id} className="display-mode-field">
                  <label htmlFor={field.id}>{field.label}</label>
                  {field.type === 'text' && (
                      <input
                          type="text"
                          id={field.id}
                          value={field.answer || ''}  // Use field.answer
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                      />
                  )}
                  {field.type === 'select' && (
                      <select
                          id={field.id}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          value={field.answer || ''} // Use field.answer
                      >
                          <option value="">Выберите значение</option>
                          {field.options && field.options.map((option, index) => (
                              <option key={index} value={option}>{option}</option>
                          ))}
                      </select>
                  )}
              </div>
          ))}
      </div>
  );
}

export default DisplayModeSection;