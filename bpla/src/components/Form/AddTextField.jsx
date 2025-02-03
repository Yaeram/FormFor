import React from 'react';
import './AddTextField.css'; // Создайте файл AddTextField.css

function AddTextField({ onAddField }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const label = e.target.elements.label.value;
    if (label.trim() !== '') {
      onAddField({ label, type: 'text', value: '' });
      e.target.reset(); // Очистка формы после добавления
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-text-field">
      <label>
        Название поля:
        <input type="text" name="label" required />
      </label>
      <button type="submit">Добавить текстовое поле</button>
    </form>
  );
}

export default AddTextField;