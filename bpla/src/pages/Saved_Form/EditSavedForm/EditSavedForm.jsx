import React, { useState, useEffect } from 'react';
import './EditSavedForm.css';
import ConfirmationDialog from '../../Form/cp_Form/Confirmation_Dialog/Confirmation_Dialog';
import { v4 as uuidv4 } from 'uuid';

function EditSavedForm({
    formFields = [],
    onUpdateField = () => {},
    onUpdateOptions = () => {},
    onDeleteField = () => {},
    onUpdateAnswer = () => {},
    saveChanges = () => {},
    tableDataArray,
    onUpdateTableName,
    onUpdateTable
}) {
    const initializeField = (field) => ({
        id: field.id || uuidv4(),
        type: field.type || 'text',
        label: field.label || '',
        options: Array.isArray(field.options) ? field.options : [],
        answer: getDefaultAnswer(field.type, field.answer)
    });

    function getDefaultAnswer(type, answer) {
        switch (type) {
            case 'image':
                return Array.isArray(answer) ? answer : [];
            case 'video':
                return answer && typeof answer === 'object' && Array.isArray(answer.videos) 
                    ? answer 
                    : { videos: [] };
            case 'select':
                return answer || '';
            default:
                return answer !== undefined ? answer : '';
        }
    }

    const [currentFormFields, setCurrentFormFields] = useState(
        formFields.map(initializeField)
    );

    const [confirmationDialog, setConfirmationDialog] = useState({
        isOpen: false,
        message: '',
        onConfirm: null,
        onClose: null,
    });

    useEffect(() => {
        setCurrentFormFields(formFields.map(initializeField));
    }, [formFields]);

    const handleAddOption = (fieldId) => {
        const updatedFields = currentFormFields.map(field =>
            field.id === fieldId ? { 
                ...field, 
                options: [...field.options, ''] 
            } : field
        );
        setCurrentFormFields(updatedFields);
        onUpdateOptions(fieldId, updatedFields.find(f => f.id === fieldId).options);
    };

    const handleOptionChange = (fieldId, index, value) => {
        const updatedFields = currentFormFields.map(field => {
            if (field.id === fieldId) {
                const newOptions = [...field.options];
                newOptions[index] = value;
                return { ...field, options: newOptions };
            }
            return field;
        });
        setCurrentFormFields(updatedFields);
        onUpdateOptions(fieldId, updatedFields.find(f => f.id === fieldId).options);
    };

    const handleRemoveOption = (fieldId, index) => {
        const updatedFields = currentFormFields.map(field => {
            if (field.id === fieldId) {
                const newOptions = field.options.filter((_, i) => i !== index);
                return { ...field, options: newOptions };
            }
            return field;
        });
        setCurrentFormFields(updatedFields);
        onUpdateOptions(fieldId, updatedFields.find(f => f.id === fieldId).options);
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

    const handleTableLabelChange = (event, tableId) => {
        onUpdateTableName(tableId, event.target.value)
    }

    const handleAnswerChange = (fieldId, value) => {
        const updatedFields = currentFormFields.map(field =>
            field.id === fieldId ? { 
                ...field, 
                answer: value !== undefined ? value : getDefaultAnswer(field.type, value)
            } : field
        );
        setCurrentFormFields(updatedFields);
        onUpdateAnswer(fieldId, updatedFields.find(f => f.id === fieldId).answer);
    };

    const handleImageUpload = (fieldId, event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const newImages = [];
        let loadedCount = 0;

        files.forEach(file => {
            if (!file.type.match('image.*')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                newImages.push(e.target.result);
                loadedCount++;

                if (loadedCount === files.length) {
                    handleAnswerChange(fieldId, [...newImages] )
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleVideoUpload = (fieldId, event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const field = currentFormFields.find(f => f.id === fieldId);
        const currentVideos = (field?.answer?.videos || []);

        const newVideos = files
            .filter(file => file.type.match('video.*'))
            .map(file => URL.createObjectURL(file));

        if (newVideos.length > 0) {
            handleAnswerChange(fieldId, {
                ...(field?.answer || {}),
                videos: [...currentVideos, ...newVideos]
            });
        }
    };

    const handleUpdateLabel = (fieldId, newLabel) => {
        const updatedFields = currentFormFields.map(field =>
            field.id === fieldId ? { ...field, label: newLabel || '' } : field
        );
        setCurrentFormFields(updatedFields);
        onUpdateField(fieldId, newLabel || '');
    };

    const handleDelete = (fieldId) => {
        setConfirmationDialog({
            isOpen: true,
            message: 'Вы уверены, что хотите удалить это поле?',
            onConfirm: () => {
                const updatedFields = currentFormFields.filter(field => field.id !== fieldId);
                setCurrentFormFields(updatedFields);
                onDeleteField(fieldId);
                setConfirmationDialog({ ...confirmationDialog, isOpen: false });
            },
            onClose: () => setConfirmationDialog({ ...confirmationDialog, isOpen: false })
        });
    };

    const handleSaveChangesClick = () => {
        setConfirmationDialog({
            isOpen: true,
            message: 'Вы уверены, что хотите сохранить изменения?',
            onConfirm: () => {
                saveChanges();
                setConfirmationDialog({ ...confirmationDialog, isOpen: false });
            },
            onClose: () => setConfirmationDialog({ ...confirmationDialog, isOpen: false })
        });
    };

    return (
        <div className="edit-saved-form-container">
            {currentFormFields.map(field => (
                <div key={field.id} className="edit-saved-form-field">
                    <div className="field-header">
                        <label>
                            Метка поля:
                            <input
                                type="text"
                                value={field.label || ''}
                                onChange={(e) => handleUpdateLabel(field.id, e.target.value)}
                            />
                        </label>
                    </div>

                    {field.type === 'text' && (
                        <>
                            <label>
                                Ответ:
                                <input
                                    type="text"
                                    value={field.answer || ''}
                                    onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                                />
                            </label>
                            <button 
                                className="delete-field-btn"
                                onClick={() => handleDelete(field.id)}
                                >
                                Удалить поле
                            </button>
                        </>
                        
                    )}

                    {field.type === 'select' && (
                        <div className="select-field">
                            <label>Опции выбора:</label>
                            <select
                                value={field.answer || ''}
                                onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            >
                                <option value="">Выберите значение</option>
                                {field.options.map((option, index) => (
                                    <option key={index} value={option}>
                                        {option || `Опция ${index + 1}`}
                                    </option>
                                ))}
                            </select>

                            <div className="options-list">
                                {field.options.map((option, index) => (
                                    <div key={index} className="option-item">
                                        <input
                                            type="text"
                                            value={option || ''}
                                            onChange={(e) => handleOptionChange(field.id, index, e.target.value)}
                                        />
                                        <button 
                                            className="remove-option-btn"
                                            onClick={() => handleRemoveOption(field.id, index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button 
                                className="add-option-btn"
                                onClick={() => handleAddOption(field.id)}
                            >
                                + Добавить опцию
                            </button>
                        </div>
                    )}

                    {field.type === 'image' && (
                        <div className="image-field">
                            <label>
                                Загрузить изображения:
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleImageUpload(field.id, e)}
                                />
                            </label>
                            <div className="image-preview">
                                {(field.answer || []).map((image, index) => (
                                    <div key={index} className="image-thumbnail">
                                        <img 
                                            src={image} 
                                            alt={`Изображение ${index + 1}`}
                                            style={{ maxWidth: '200px', margin: '5px' }} 
                                            onError={(e) => {
                                                e.target.src = 'placeholder-image-url';
                                                e.target.alt = 'Не удалось загрузить изображение';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {field.type === 'video' && (
                        <div className="video-field">
                            <label>
                                Загрузить видео:
                                <input
                                    type="file"
                                    accept="video/*"
                                    multiple
                                    onChange={(e) => handleVideoUpload(field.id, e)}
                                />
                            </label>
                            <div className="video-preview">
                                {((field.answer || {}).videos || []).map((video, index) => (
                                    <div key={index} className="video-thumbnail">
                                        <video controls>
                                            <source src={video} type="video/mp4" />
                                            Ваш браузер не поддерживает видео
                                        </video>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}      
                </div>
            ))}

            {tableDataArray && tableDataArray.length > 0 && (
                        tableDataArray.map((tableData, tableIndex) => (
                            <div key={tableIndex} className='edit-table'>
                                <label>
                                Название таблицы:
                                <input
                                    type="text"
                                    value={tableData.tableName || ''}
                                    onChange={(event) => handleTableLabelChange(event, tableIndex)}
                                />
                                </label>
                                <table>
                                    <tbody>
                                        {tableData.tableData.map((row, rowIndex) => (
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

            <div className="form-actions">
                <button 
                    className="save-changes-btn"
                    onClick={handleSaveChangesClick}
                >
                    Сохранить изменения
                </button>
            </div>

            <ConfirmationDialog
                isOpen={confirmationDialog.isOpen}
                message={confirmationDialog.message}
                onConfirm={confirmationDialog.onConfirm}
                onClose={confirmationDialog.onClose}
            />
        </div>
    );
}

export default EditSavedForm;