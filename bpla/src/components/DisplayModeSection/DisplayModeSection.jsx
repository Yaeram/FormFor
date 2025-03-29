import React from 'react';

function DisplayModeSection({ formData, tableDataArray, handleInputChange, handleTableChange, canEdit }) {
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
        const files = event.target.files;
        if (files && files.length > 0) {
            const readers = [];
            const base64Strings = [];
 
            for (let i = 0; i < files.length; i++) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    base64Strings.push(reader.result);
    
                    if (base64Strings.length === files.length) {
                        handleInputChange(fieldId, base64Strings);
                    }
                };
                reader.readAsDataURL(files[i]);
            }
        }
    };

    return (
        <div className="display-mode-section">
            {formData && formData.map(field => (
                <div key={field.id} className="display-mode-field">
                    <label htmlFor={field.id}>Название поля:{field.label}</label>
                    {field.type === 'text' && (
                    <div>
                        {canEdit &&
                        <input
                            type="text"
                            id={field.id}
                            value={field.answer || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />} 
                        {field.answer && (
                            <span>Значение поля: {field.answer}</span>
                        )}
                    </div>
                    )}
                    {field.type === 'select' && (                       
                        <div>
                            {canEdit && 
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
                                {field.answer && (
                                    <span>Значение поля: {field.answer}</span>
                                )}
                        </div>
                    )}
                    {field.type === 'image' && (
                        <div>
                            {canEdit && (
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleImageUpload(field.id, e)}
                                />
                            )}
                            {field.answer && (
                                <div>
                                    {console.log(field)}
                                    Значение поля: {field.answer.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`Uploaded ${index}`}
                                            style={{ maxWidth: '200px', margin: '5px' }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {field.type === 'video' && (
                        <div>
                            {canEdit && (
                                <input
                                    type="file"
                                    accept="video/mp4, video/webm, video/ogg, video/x-matroska"
                                    multiple // Разрешаем выбор нескольких файлов
                                    onChange={(e) => handleImageUpload(field.id, e)}
                                />
                            )}
                            {field.answer && (
                                <div>
                                    Значение поля: {field.answer.map((video) => (
                                        <video width="320" height="240" controls poster='Видео загружается' muted>
                                            <source src={video} alt="Uploaded" type='video/x-matroska'autoplay="autoplay"></source>
                                            <source src={video} alt="Uploaded" type='video/mp4' autoplay="autoplay"></source>
                                            <source src={video} alt="Uploaded" type='video/ogg' autoplay="autoplay"></source>
                                            <source src={video} alt="Uploaded" type='video/webm' autoplay="autoplay"></source>
                                            Your browser does not support a video tag!
                                        </video>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
            {tableDataArray && tableDataArray.length > 0 && (
                <div className="table-container">
                    {tableDataArray.map((table, tableIndex) => {
                        if (!Array.isArray(table.tableData)) {
                            console.warn(`Элемент с индексом ${tableIndex} в tableDataArray не является массивом:`, table);
                            return null;
                        }
                        return (
                            <table key={tableIndex} className="display-table">
                                <tbody>
                                    {table.tableData.map((row, rowIndex) => {
                                        if (!Array.isArray(row)) {
                                            console.warn(`Элемент с индексом ${rowIndex} в таблице ${tableIndex} не является массивом:`, row);
                                            return null;
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

