import React from 'react';
import Form_Field from '../Form_Field/Form_Field';

function DisplayModeSection({ formData, tableDataArray, handleInputChange, handleTableChange, isEditMode, isNoInput }) {
    const handleTableCellChange = (tableIndex, rowIndex, colIndex, value) => {
        handleTableChange = (tableIndex, (prevTableData) => {
            const newTableData = [...prevTableData];
            const newRow = [...newTableData[rowIndex]];
            newRow[colIndex] = value;
            newTableData[rowIndex] = newRow;
            return newTableData;
        });
    };

    const handleImageUpload = (fieldId, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                // Сохраняем base64 строку в состоянии формы
                handleInputChange(fieldId, base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="display-mode-section">
            {formData && formData.map(field => (
                <div key={field.id} className="display-mode-field">
                    <label htmlFor={field.id}>{field.label}</label>
                    {field.type === 'text' && (
                    <div>
                        {isNoInput &&
                        <input
                            type="text"
                            id={field.id}
                            value={field.answer || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />} 
                        {field.answer}
                    </div>
                    )}
                    {field.type === 'select' && (
                        
                        <div>
                            {isNoInput && 
                                <select
                                    id={field.id}
                                    value={field.answer || ''}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                > 
                                    <option value="">Выберите значение</option>
                                    {field.options && field.options.map((option, index) => (
                                        <option key={index} value={option}>{option}</option>
                                    ))}
                                </select>}
                            {field.answer}
                        </div>
                    )}
                    {field.type === 'image' && (
                        <div>
                            {isNoInput &&
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(field.id, e)}
                            />}
                            {field.answer && (
                                <img src={field.answer} alt="Uploaded" style={{ maxWidth: '200px' }} />
                            )}
                        </div>
                    )}

                    {field.type === 'video' && (
                        <div>
                            {isNoInput && 
                                <input
                                type="file"
                                accept="video/mp4, video/webm, video/ogg, video/x-matroska"
                                onChange={(e) => handleImageUpload(field.id, e)}
                            />}
                            {field.answer && (
                                <video width="320" height="240" controls poster='Видео загружается' muted>
                                    <source src={field.answer} alt="Uploaded" type='video/x-matroska' ></source>
                                    <source src={field.answer} alt="Uploaded" type='video/mp4'></source>
                                    <source src={field.answer} alt="Uploaded" type='video/ogg'></source>
                                    <source src={field.answer} alt="Uploaded" type='video/webm'></source>
                                    Your browser does not support a video tag!
                                </video>
                            )}
                        </div>
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

