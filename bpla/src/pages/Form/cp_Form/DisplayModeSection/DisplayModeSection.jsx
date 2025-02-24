import React from 'react';
import Form_Field from '../Form_Field/Form_Field';


function DisplayModeSection({ formData, tableDataArray, handleInputChange, handleTableChange, isEditMode }) {
    const handleTableCellChange = (tableIndex, rowIndex, colIndex, value) => {
        handleTableChange = (tableIndex, (prevTableData) => {
            const newTableData = [...prevTableData];
            const newRow = [...newTableData[rowIndex]];
            newRow[colIndex] = value;
            newTableData[rowIndex] = newRow;
            return newTableData;
        });
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
                            value={field.answer || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />
                    )}
                    {field.type === 'select' && (
                        <select
                            id={field.id}
                            value={field.answer || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                        >
                            <option value="">Выберите значение</option>
                            {field.options && field.options.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                    )}
                </div>
            ))}
            {console.log(tableDataArray)}
            {tableDataArray && tableDataArray.length > 0 && (
                <div className="table-container">
                    {tableDataArray.map((table, tableIndex) => {
                        if (!Array.isArray(table.tableData)) {
                            console.warn(`Элемент с индексом ${tableIndex} в tableDataArray не является массивом:`, table);
                            return null; // Пропускаем этот элемент
                        }
                        return (
                            <table key={tableIndex} className="display-table">
                                <tbody>
                                    {table.tableData.map((row, rowIndex) => {
                                        if (!Array.isArray(row)) {
                                            console.warn(`Элемент с индексом ${rowIndex} в таблице ${tableIndex} не является массивом:`, row);
                                            return null; // Пропускаем эту строку
                                        }
                                        return (
                                            <tr key={rowIndex}>
                                                {row.map((cell, colIndex) => (
                                                    <td key={colIndex}>
                                                        <input
                                                            type="text"
                                                            value={cell}
                                                            onChange={(e) =>
                                                                handleTableCellChange(tableIndex, rowIndex, colIndex, e.target.value)
                                                            }
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default DisplayModeSection;

// function DisplayModeSection({ formData, tableDataArray, handleInputChange, handleTableChange, isEditMode }) {
//     const handleTableCellChange = (tableIndex, rowIndex, colIndex, value) => {
//         handleTableChange(tableIndex, (prevTableData) => {
//             const newTableData = [...prevTableData];
//             const newRow = [...newTableData[rowIndex]];
//             newRow[colIndex] = value;
//             newTableData[rowIndex] = newRow;
//             return newTableData;
//         });
//     };

//     return (
//         <div className="display-mode-section"> {/* Enclosing tag */}
//             {formData && formData.map(field => (
//                 <div key={field.id} className="display-mode-field">
//                     <label htmlFor={field.id}>{field.label}</label>
//                     {field.type === 'text' && (
//                         <input
//                             type="text"
//                             id={field.id}
//                             value={field.answer || ''}
//                             onChange={(e) => handleInputChange(field.id, e.target.value)} // Enable editing
//                         />
//                     )}
//                     {field.type === 'select' && (
//                         <select
//                             id={field.id}
//                             value={field.answer || ''}
//                             onChange={(e) => handleInputChange(field.id, e.target.value)} // Enable editing
//                         >
//                             <option value="">Выберите значение</option>
//                             {field.options && field.options.map((option, index) => (
//                                 <option key={index} value={option}>{option}</option>
//                             ))}
//                         </select>
//                     )}
//                 </div>
//             ))}

//             {tableDataArray && tableDataArray.length > 0 && (
//                 <div className="table-container">
//                     {tableDataArray.map((tableData, tableIndex) => (
//                         <table key={tableIndex} className="display-table">
//                             <tbody>
//                                 {tableData.map((row, rowIndex) => (
//                                     <tr key={rowIndex}>
//                                         {row.map((cell, colIndex) => (
//                                             <td key={colIndex}>
//                                                 <input
//                                                     type="text"
//                                                     value={cell}
//                                                     onChange={(e) =>
//                                                         handleTableCellChange(tableIndex, rowIndex, colIndex, e.target.value)
//                                                     }
//                                                 />
//                                             </td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                                 </tbody>
//                             </table>
//                         ))}
//                     </div>
//                 )}
//             </div>   
//     );
// }

// export default DisplayModeSection;

// function DisplayModeSection({ formData, tableDataArray, handleInputChange, handleTableChange, isEditMode }) {

//     const handleInputChangeWrapper = (fieldId, value) => {
//         if (isEditMode) {
//             handleInputChange(fieldId, value);
//         }
//     };

//     const handleTableCellChange = (tableIndex, rowIndex, colIndex, value) => {
//         handleTableChange(tableIndex, (prevTableData) => {
//             const newTableData = [...prevTableData];
//             const newRow = [...newTableData[rowIndex]];
//             newRow[colIndex] = value;
//             newTableData[rowIndex] = newRow;
//             return newTableData;
//         });
//     };

//     return (
//         <div className="display-mode-section">
//             {/* Display form fields (read-only) */}
//             {formData && formData.map(field => (
//                 <div key={field.id} className="display-mode-field">
//                     <label htmlFor={field.id}>{field.label}</label>
//                     {field.type === 'text' && (
//                         <input
//                             type="text"
//                             id={field.id}
//                             value={field.answer || ''}
//                             readOnly // Make the input read-only
//                         />
//                     )}
//                     {field.type === 'select' && (
//                         <select
//                             id={field.id}
//                             value={field.answer || ''}
//                             onChange={(e) => handleInputChangeWrapper(field.id, e.target.value)}
//                         >
//                             <option value="">Выберите значение</option>
//                             {field.options && field.options.map((option, index) => (
//                                 <option key={index} value={option}>{option}</option>
//                             ))}
//                         </select>
//                     )}
//                 </div>
//             ))}

//             {/* Display and edit tables */}
//             {tableDataArray && tableDataArray.length > 0 && (
//                 <div className="table-container">
//                     {tableDataArray.map((tableData, tableIndex) => (
//                         <table key={tableIndex} className="display-table">
//                             <tbody>
//                                 {tableData.map((row, rowIndex) => (
//                                     <tr key={rowIndex}>
//                                         {row.map((cell, colIndex) => (
//                                             <td key={colIndex}>
//                                                 <input
//                                                     type="text"
//                                                     value={cell}
//                                                     onChange={(e) =>
//                                                         handleTableCellChange(tableIndex, rowIndex, colIndex, e.target.value)
//                                                     }
//                                                 />
//                                             </td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default DisplayModeSection;

// function DisplayModeSection({ formData, tableDataArray, handleInputChange }) {
//     return (
//         <div className="display-mode-section">
//             {/* Display form fields */}
//             {formData && formData.map(field => (
//                 <div key={field.id} className="display-mode-field">
//                     <label htmlFor={field.id}>{field.label}</label>
//                     {field.type === 'text' && (
//                         <input
//                             type="text"
//                             id={field.id}
//                             value={field.answer || ''}
//                             readOnly // Make the input read-only in display mode
//                         />
//                     )}
//                     {field.type === 'select' && (
//                         <select
//                             id={field.id}
//                             value={field.answer || ''}
//                             disabled // Disable the select element in display mode
//                         >
//                             <option value="">Выберите значение</option>
//                             {field.options && field.options.map((option, index) => (
//                                 <option key={index} value={option}>{option}</option>
//                             ))}
//                         </select>
//                     )}
//                 </div>
//             ))}

//             {/* Display tables */}
//             {tableDataArray && tableDataArray.length > 0 && (
//                 <div className="table-container">
//                     {tableDataArray.map((tableData, index) => (
//                         <table key={index} className="display-table">
//                             <tbody>
//                                 {tableData.map((row, rowIndex) => (
//                                     <tr key={rowIndex}>
//                                         {row.map((cell, colIndex) => (
//                                             <td key={colIndex}>{cell}</td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default DisplayModeSection;

// function DisplayModeSection({ formData, handleInputChange }) {
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
//         </div>
//     );
// }

// export default DisplayModeSection;

