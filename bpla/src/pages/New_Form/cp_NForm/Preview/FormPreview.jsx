import React from 'react';
import './FormPreview.css';

function FormPreview({ formFields, tableDataArray, onDeleteField, onDeleteTable }) {
    return (
        <div className="form-preview">
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
                    <button onClick={() => onDeleteField(field.id)}>Удалить поле</button>
                </div>
            ))}

            {/* Отображение таблиц */}
            {tableDataArray && tableDataArray.length > 0 && (
                tableDataArray.map((tableData, index) => (
                    <div key={index} className="table-preview">
                        <table>
                            <tbody>
                                {tableData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, colIndex) => (
                                            <td key={colIndex}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => onDeleteTable(index)}>Удалить таблицу</button> {/* Добавляем кнопку */}
                    </div>
                ))
            )}
        </div>
    );
}

export default FormPreview;

// function FormPreview({ formFields, onDeleteField }) {
//   return (
//     <div className="form-preview">
//       {formFields.map((field) => (
//         <div key={field.id} className="form-field-preview">
//            <label>{field.label}:</label>
//            {field.type === 'text' && <input type="text" />}
//            {field.type === 'select' && (
//               <select>
//                  {field.options.map((option, index) => (
//                     <option key={index}>{option}</option>
//                  ))}
//               </select>
//            )}
//            <button onClick={() => onDeleteField(field.id)}>Удалить</button>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default FormPreview;