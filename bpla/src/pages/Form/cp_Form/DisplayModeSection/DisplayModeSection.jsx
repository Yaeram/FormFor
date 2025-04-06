import React from 'react';
import './DisplayModeSection.css'

function DisplayModeSection({ templateTitle, formData, tableDataArray, handleInputChange, onUpdateTable, canEdit }) {
    const handleTableCellChange = (tableIndex, rowIndex, colIndex, value) => {
        const newTableData = [...tableDataArray[tableIndex].tableData];
        const newRow = [...newTableData[rowIndex]];
        newRow[colIndex] = value;
        newTableData[rowIndex] = newRow;
        
        const updatedTable = {
            ...tableDataArray[tableIndex],
            tableData: newTableData
        };
        
        onUpdateTable(tableIndex, updatedTable);
    };

    const handleImageUpload = (fieldId, event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
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
            {/* <h3>{templateTitle}</h3> */}
            {formData && formData.map(field => (
                <div key={field.id} className="display-mode-field">
                    <label htmlFor={field.id}>{field.label}</label>
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
                            <span>{field.answer}</span>
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
                                    <span>{field.answer}</span>
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
                                    {field.answer.map((image, index) => (
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
                                    multiple
                                    onChange={(e) => handleImageUpload(field.id, e)}
                                />
                            )}
                            {field.answer && (
                                <div>
                                    {field.answer.map((video) => (
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
                        if (!table || !Array.isArray(table.tableData)) {
                            console.log(`Элемент с индексом ${tableIndex} в tableDataArray не является массивом:`, table);
                            return null;
                        }
                        return (
                            <>
                            <label htmlFor={tableIndex}>{table.tableName}</label>
                            <table key={tableIndex} className="display-table">
                                <tbody>
                                    {table.tableData.map((row, rowIndex) => {
                                        if (!Array.isArray(row)) {
                                            console.log(`Элемент с индексом ${rowIndex} в таблице ${tableIndex} не является массивом:`, row);
                                            return null;
                                        }
                                        return (
                                            <tr key={rowIndex}>
                                                {row.map((cell, colIndex) => (
                                                    <td key={colIndex}>

                                                        {canEdit ? <input
                                                            type="text"
                                                            value={cell}
                                                            onChange={(e) =>
                                                                handleTableCellChange(tableIndex, rowIndex, colIndex, e.target.value)
                                                            }
                                                        /> : cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table></> 
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default DisplayModeSection;

