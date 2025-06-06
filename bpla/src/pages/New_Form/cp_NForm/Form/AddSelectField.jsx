import React, { useState } from 'react';
import './AddSelectField.css';

function AddSelectField({ onAddField }) {
  const [label, setLabel] = useState('');
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState('');

  const handleLabelChange = (e) => setLabel(e.target.value);
  const handleOptionChange = (index, e) => {
      const newOptions = [...options];
      newOptions[index] = e.target.value;
      setOptions(newOptions);
  };

  const handleNewOptionChange = (e) => {
      setNewOption(e.target.value);
  };

  const handleAddOption = () => {
      if (newOption.trim() !== '') {
          setOptions([...options, newOption]);
          setNewOption('');
      }
  };

  const handleDeleteOption = (index) => {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      const validOptions = options.filter((option) => option.trim() !== '');
      if (label.trim() !== '' && validOptions.length > 0) {
          onAddField({
              label: label,
              type: 'select',
              options: validOptions,
          });
          setLabel('');
          setOptions([]);
      }
  };

  return (
      <form onSubmit={handleSubmit} className="add-select-field">
          <label>
              Название поля:
              <input type="text" value={label} onChange={handleLabelChange} required />
          </label>
          <div>
              Варианты ответа:
              {options.map((option, index) => (
                  <div key={index} className="option-item">
                      <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e)}
                          required
                      />
                      <button type="button" onClick={() => handleDeleteOption(index)}>Удалить вариант</button>
                  </div>
              ))}
              <input
                  type="text"
                  placeholder="Новый вариант"
                  value={newOption}
                  onChange={handleNewOptionChange}
              />
              <button type="button" onClick={handleAddOption}>Добавить вариант</button>
          </div>
          <button type="submit">Добавить поле выбора</button>
      </form>
  );
}

export default AddSelectField;

