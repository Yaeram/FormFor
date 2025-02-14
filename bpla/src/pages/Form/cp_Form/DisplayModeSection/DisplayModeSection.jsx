import React from 'react';
import Form_Field from '../Form_Field/Form_Field';

function DisplayModeSection({ formData, tableDataArray, handleInputChange, onUpdateTable }) {

    const handleCellChange = (tableIndex, rowIndex, colIndex, value) => {
        const updatedTableDataArray = [...tableDataArray];
        updatedTableDataArray[tableIndex][rowIndex][colIndex] = value;
        onUpdateTable(tableIndex, updatedTableDataArray[tableIndex]); //  Обновляем данные таблицы
    };

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

            {/* Отображение таблиц */}
            {tableDataArray && tableDataArray.length > 0 && (
                tableDataArray.map((tableData, tableIndex) => (
                    <div key={tableIndex}>
                        <table>
                            <tbody>
                                {tableData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, colIndex) => (
                                            <td key={colIndex}>
                                                <input
                                                    type="text"
                                                    value={cell}
                                                    onChange={(e) => handleCellChange(tableIndex, rowIndex, colIndex, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            )}
        </div>
    );
}

export default DisplayModeSection;
// function DisplayModeSection({ formData, tableDataArray, handleInputChange }) {
//     return (
//         <div className="display-mode-section">
//             {formData && formData.map(field => (
//                 <div key={field.id} className="display-mode-field">
//                     <label htmlFor={field.id}>{field.label}</label>
//                     {field.type === 'text' && (
//                         <input
//                             type="text"
//                             id={field.id}
//                             value={field.answer || ''}  // Use field.answer
//                             onChange={(e) => handleInputChange(field.id, e.target.value)}
//                         />
//                     )}
//                     {field.type === 'select' && (
//                         <select
//                             id={field.id}
//                             onChange={(e) => handleInputChange(field.id, e.target.value)}
//                             value={field.answer || ''} // Use field.answer
//                         >
//                             <option value="">Выберите значение</option>
//                             {field.options && field.options.map((option, index) => (
//                                 <option key={index} value={option}>{option}</option>
//                             ))}
//                         </select>
//                     )}
//                 </div>
//             ))}

//             {/* Отображение таблиц */}
//             {tableDataArray && tableDataArray.length > 0 && (
//                 tableDataArray.map((tableData, index) => (
//                     <div key={index}>
//                         <table>
//                             <tbody>
//                                 {tableData.map((row, rowIndex) => (
//                                     <tr key={rowIndex}>
//                                         {row.map((cell, colIndex) => (
//                                             <td key={colIndex}>
//                                                 {cell}
//                                             </td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 ))
//             )}
//         </div>
//     );
// }

// export default DisplayModeSection;

// function DisplayModeSection({ formData, handleInputChange }) {
//   return (
//       <div className="display-mode-section">
//           {formData && formData.map(field => (
//               <div key={field.id} className="display-mode-field">
//                   <label htmlFor={field.id}>{field.label}</label>
//                   {field.type === 'text' && (
//                       <input
//                           type="text"
//                           id={field.id}
//                           value={field.answer || ''}  // Use field.answer
//                           onChange={(e) => handleInputChange(field.id, e.target.value)}
//                       />
//                   )}
//                   {field.type === 'select' && (
//                       <select
//                           id={field.id}
//                           onChange={(e) => handleInputChange(field.id, e.target.value)}
//                           value={field.answer || ''} // Use field.answer
//                       >
//                           <option value="">Выберите значение</option>
//                           {field.options && field.options.map((option, index) => (
//                               <option key={index} value={option}>{option}</option>
//                           ))}
//                       </select>
//                   )}
//               </div>
//           ))}
//       </div>
//   );
// }

// export default DisplayModeSection;