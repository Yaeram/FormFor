import React, { useState } from 'react';
import './AddTextField.css'; // Создайте файл AddTextField.css

function AddTextField({ onAddField }) {
    const [label, setLabel] = useState('');
    const [type, setType] = useState('text'); // Состояние для хранения выбранного типа

    const handleSubmit = (e) => {
        e.preventDefault();
        if (label.trim() !== '') { // Проверяем, что название поля не пустое
            onAddField({ label, type, value: '' }); // Передаем тип поля
            setLabel(''); // Очищаем название поля
            setType('text'); // Сбрасываем тип поля к значению по умолчанию
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-text-field">
            <label>
                Название поля:
                <input type="text" name="label" value={label} onChange={(e) => setLabel(e.target.value)} required />
            </label>
            <label>
                Тип поля:
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="text">Текст</option>
                    <option value="image">Изображение</option>
                    <option value="video">Видео</option>
                </select>
            </label>
            <button type="submit">Добавить поле</button>
        </form>
    );
}

export default AddTextField;

// function AddTextField({ onAddField }) {
//   const [type, setType] = useState('text'); // Состояние для хранения выбранного типа

//   const handleSubmit = (e) => {
//       e.preventDefault();
//       const label = e.target.elements.label.value;
//       if (label.trim() !== '') {
//           onAddField({ label, type, value: '' }); // Передаем тип поля
//           e.target.reset(); // Очистка формы после добавления
//           setType('text'); // Сбрасываем тип поля к значению по умолчанию
//       }
//   };

//   return (
//       <form onSubmit={handleSubmit} className="add-text-field">
//           <label>
//               Название поля:
//               <input type="text" name="label" required />
//           </label>
//           <label>
//               Тип поля:
//               <select value={type} onChange={(e) => setType(e.target.value)}>
//                   <option value="text">Текст</option>
//                   <option value="image">Изображение</option>
//                   <option value="video">Видео</option>
//               </select>
//           </label>
//           <button type="submit">Добавить поле</button>
//       </form>
//   );
// }

// export default AddTextField;

// function AddTextField({ onAddField }) {
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const label = e.target.elements.label.value;
//     if (label.trim() !== '') {
//       onAddField({ label, type: 'text', value: '' });
//       e.target.reset(); // Очистка формы после добавления
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="add-text-field">
//       <label>
//         Название поля:
//         <input type="text" name="label" required />
//       </label>
//       <button type="submit">Добавить текстовое поле</button>
//     </form>
//   );
// }

// export default AddTextField;