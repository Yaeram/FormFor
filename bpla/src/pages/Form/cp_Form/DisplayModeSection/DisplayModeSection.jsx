import React from 'react';
import Form_Field from '../Form_Field/Form_Field';

function DisplayModeSection({ formData, handleInputChange }) {
  return (
    <>
      {formData.map(field => (
        <Form_Field
          key={field.id}
          field={field}
          handleInputChange={handleInputChange}
        />
      ))}
    </>
  );
}

export default DisplayModeSection;