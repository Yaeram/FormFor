import React, { useState } from 'react';
import './Edit_Mode.css';

function Edit_Mode({ formFields, tableDataArray, onDeleteField, onUpdateField, onUpdateOptions, onDeleteTable, onUpdateTable, handleInputChange }) {
    console.log(formFields)
    const [newOption, setNewOption] = useState('');

    const handleLabelChange = (event, fieldId) => {
        onUpdateField(fieldId, event.target.value);
    };

    const handleAddOption = (fieldId) => {
        onUpdateOptions(fieldId, [...(formFields.find(field => field.id === fieldId)?.options || []), newOption]);
        setNewOption('');
    };

    const handleDeleteOption = (fieldId, optionIndex) => {
        const updatedOptions = formFields.find(field => field.id === fieldId).options.filter((_, index) => index !== optionIndex);
        onUpdateOptions(fieldId, updatedOptions);
    };

    const handleFieldChange = (fieldId, value) => {
        handleInputChange(fieldId, value);
    };

    const handleImageUpload = (fieldId, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                handleFieldChange(fieldId, base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVideoUpload = (fieldId, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                handleFieldChange(fieldId, base64String);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleCellChange = (tableIndex, rowIndex, colIndex, value) => {
        const updatedTableDataArray = [...tableDataArray];
        if (!updatedTableDataArray[tableIndex] || !Array.isArray(updatedTableDataArray[tableIndex].tableData)) {
            console.warn(`Invalid table index: ${tableIndex}.  tableDataArray:`, updatedTableDataArray);
            return;
        }
        if (!updatedTableDataArray[tableIndex].tableData[rowIndex] || !Array.isArray(updatedTableDataArray[tableIndex].tableData[rowIndex])) {
            console.warn(`Invalid row index: ${rowIndex} in table ${tableIndex}.  Row:`, updatedTableDataArray[tableIndex]);
            return;
        }

        updatedTableDataArray[tableIndex].tableData[rowIndex][colIndex] = value;
        onUpdateTable(tableIndex, updatedTableDataArray[tableIndex]);
    };


    return (
        <div className="edit-mode">
            <h3>Режим редактирования шаблона</h3>

            {formFields.map(field => (
                <div key={field.id} className="edit-field">
                    <label>
                        Название поля:
                        <input
                            type="text"
                            value={field.label || ''}
                            onChange={(event) => handleLabelChange(event, field.id)}
                        />
                    </label>
                    {field.type === 'text' && (
                        <>
                            <label>
                                Значение поля:
                                <input
                                    type="text"
                                    value={field.answer || ''}
                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                />
                            </label>
                        </>
                    )}

                    {field.type === 'select' && (
                        <>
                            <label>Варианты ответов:</label>
                            <ul>
                                {field.options?.map((option, index) => (
                                    <li key={index}>
                                        {option}
                                        <button onClick={() => handleDeleteOption(field.id, index)}>Удалить</button>
                                    </li>
                                ))}
                            </ul>
                            <div>
                                <input
                                    type="text"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                />
                                <button onClick={() => handleAddOption(field.id)}>Добавить вариант</button>
                            </div>
                            <label>
                                Выбрано:
                                <select
                                    value={field.answer || ''}
                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                >
                                    <option value="">Выберите...</option>
                                    {field.options?.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </label>
                        </>
                    )}
                    {field.type === 'image' && (
                        <div>
                            <label>Фотография:</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(field.id, e)}
                            />
                            {field.answer && (
                                <img src={field.answer} alt="Uploaded" style={{ maxWidth: '200px' }} />
                            )}
                        </div>
                    )}
                    {field.type === 'video' && (
                        <div>
                            <label>Видео:</label>
                            <input
                                type="file"
                                accept="video/mp4, video/webm, video/ogg, video/x-matroska"
                                onChange={(e) => handleVideoUpload(field.id, e)}
                            />
                            {field.answer && (
                                <video width="320" height="240" controls>
                                    <source src={field.answer}/>
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                    )}
                    <button onClick={() => onDeleteField(field.id)}>Удалить</button>
                </div>
            ))}

            {/*  Отображение таблиц */}
            {tableDataArray && tableDataArray.length > 0 && (
                tableDataArray.map((tableData, tableIndex) => (
                    <div key={tableIndex}>
                        <table>
                            <tbody>
                                {tableData.tableData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, colIndex) => (
                                            <td key={colIndex}>
                                                {/*  Если это крайняя левая или верхняя ячейка, делаем ее редактируемой */}
                                                {(rowIndex === 0 || colIndex === 0) ? (

                                                    <input
                                                        type="text"
                                                        value={cell}
                                                        onChange={(e) => handleCellChange(tableIndex, rowIndex, colIndex, e.target.value)}
                                                    />
                                                ) : (
                                                    /*  Иначе отображаем текст */
                                                    <input style={{ pointerEvents: 'none' }}
                                                        type="text"
                                                        value={cell}
                                                    />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => onDeleteTable(tableIndex)}>Удалить таблицу</button>
                    </div>
                ))
            )}
        </div>
    );
}

export default Edit_Mode;

