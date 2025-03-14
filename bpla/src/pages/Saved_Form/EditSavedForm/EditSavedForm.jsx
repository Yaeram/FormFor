import React, { useState, useEffect } from 'react';
import './EditSavedForm.css';

function EditSavedForm({
    formFields,
    onUpdateField,
    onUpdateOptions,
    onDeleteField,
    onUpdateAnswer,
    saveChanges,
}) {
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [currentFormFields, setCurrentFormFields] = useState([...formFields]);

    useEffect(() => {
        setCurrentFormFields([...formFields]);
    }, [formFields]);

    const handleAddOption = (fieldId) => {
        const updatedFields = currentFormFields.map(field =>
            field.id === fieldId ? { ...field, options: [...field.options, ''] } : field
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
                const newOptions = [...field.options];
                newOptions.splice(index, 1);
                return { ...field, options: newOptions };
            }
            return field;
        });
        setCurrentFormFields(updatedFields);
        onUpdateOptions(fieldId, updatedFields.find(f => f.id === fieldId).options);
    };

    const handleAnswerChange = (fieldId, value) => {
        const updatedFields = currentFormFields.map(field =>
            field.id === fieldId ? { ...field, answer: value } : field
        );
        setCurrentFormFields(updatedFields);
        onUpdateAnswer(fieldId, value);
    };

    const handleSaveChangesClick = () => {
        setIsConfirmationOpen(true);
    };

    const handleConfirmSave = () => {
        saveChanges();
        setIsConfirmationOpen(false);
    };

    const handleCancelSave = () => {
        setIsConfirmationOpen(false);
    };

    const handleUpdateLabel = (fieldId, newLabel) => {
        const updatedFields = currentFormFields.map(field =>
            field.id === fieldId ? { ...field, label: newLabel } : field
        );
        setCurrentFormFields(updatedFields);
        onUpdateField(fieldId, newLabel);
    };

    const handleDelete = (fieldId) => {
        const updatedFields = currentFormFields.filter(field => field.id !== fieldId);
        setCurrentFormFields(updatedFields);
        onDeleteField(fieldId);
    };

    return (
        <div className="edit-saved-form-container">
            {currentFormFields.map(field => (
                <div key={field.id} className="edit-saved-form-field">
                    <label>
                        Метка поля:
                        <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleUpdateLabel(field.id, e.target.value)}
                        />
                    </label>

                    {field.type === 'text' && (
                        <label>
                            Ответ:
                            <input
                                type="text"
                                value={field.answer || ''}
                                onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            />
                        </label>
                    )}

                    {field.type === 'select' && (
                        <div>
                            <label>Опции:</label>
                            <select
                                value={field.answer || ''}
                                onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            >
                                <option value="">Выберите значение</option>
                                {field.options && field.options.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>

                            {field.options && field.options.map((option, index) => (
                                <div key={index} className="option-row">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(field.id, index, e.target.value)}
                                    />
                                    <button type="button" onClick={() => handleRemoveOption(field.id, index)}>
                                        Удалить
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddOption(field.id)}>
                                Добавить опцию
                            </button>
                        </div>
                    )}

                    <button type="button" onClick={() => handleDelete(field.id)}>Удалить поле</button>
                </div>
            ))}
            <button type="button" onClick={handleSaveChangesClick}>Сохранить изменения</button>

            {isConfirmationOpen && (
                <div>
                    <h2>Предварительный просмотр</h2>
                    <span>
                        Вы уверены, что хотите сохранить изменения?
                        <button onClick={handleConfirmSave}>Сохранить</button>
                        <button onClick={handleCancelSave}>Отмена</button>
                    </span>
                </div>
            )}
        </div>
    );
}

export default EditSavedForm;