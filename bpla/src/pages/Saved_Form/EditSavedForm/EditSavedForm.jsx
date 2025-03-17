import React, { useState, useEffect } from 'react';
import './EditSavedForm.css';
import ConfirmationDialog from '../../Form/cp_Form/Confirmation_Dialog/Confirmation_Dialog'; // Импортируем ConfirmationDialog

function EditSavedForm({
    formFields,
    onUpdateField,
    onUpdateOptions,
    onDeleteField,
    onUpdateAnswer,
    saveChanges,
}) {
    const [currentFormFields, setCurrentFormFields] = useState([...formFields]);
    const [confirmationDialog, setConfirmationDialog] = useState({
        isOpen: false,
        message: '',
        onConfirm: null,
        onClose: null,
    });

    useEffect(() => {
        setCurrentFormFields([...formFields]);
    }, [formFields]);

    // Обработка добавления опции
    const handleAddOption = (fieldId) => {
        const updatedFields = currentFormFields.map(field =>
            field.id === fieldId ? { ...field, options: [...field.options, ''] } : field
        );
        setCurrentFormFields(updatedFields);
        onUpdateOptions(fieldId, updatedFields.find(f => f.id === fieldId).options);
    };

    // Обработка изменения опции
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

    // Обработка удаления опции
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

    // Обработка изменения ответа
    const handleAnswerChange = (fieldId, value) => {
        const updatedFields = currentFormFields.map(field =>
            field.id === fieldId ? { ...field, answer: value } : field
        );
        setCurrentFormFields(updatedFields);
        onUpdateAnswer(fieldId, value);
    };

    // Обработка загрузки изображений
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
                        handleAnswerChange(fieldId, base64Strings);
                    }
                };
                reader.readAsDataURL(files[i]);
            }
        }
    };

    // Обработка загрузки видео
    const handleVideoUpload = (fieldId, files) => {
        const newVideos = Array.from(files).map(file => URL.createObjectURL(file));
        const updatedFields = currentFormFields.map(field => {
            if (field.id === fieldId) {
                const updatedVideos = [...(field.answer?.videos || []), ...newVideos];
                return { ...field, answer: { ...field.answer, videos: updatedVideos } };
            }
            return field;
        });
        setCurrentFormFields(updatedFields);
        onUpdateAnswer(fieldId, updatedFields.find(f => f.id === fieldId).answer);
    };

    // Обработка сохранения изменений
    const handleSaveChangesClick = () => {
        setConfirmationDialog({
            isOpen: true,
            message: 'Вы уверены, что хотите сохранить изменения?',
            onConfirm: handleConfirmSave,
            onClose: handleCancelSave,
        });
    };

    const handleConfirmSave = () => {
        saveChanges();
        setConfirmationDialog({ ...confirmationDialog, isOpen: false });
    };

    const handleCancelSave = () => {
        setConfirmationDialog({ ...confirmationDialog, isOpen: false });
    };

    // Обработка изменения метки поля
    const handleUpdateLabel = (fieldId, newLabel) => {
        const updatedFields = currentFormFields.map(field =>
            field.id === fieldId ? { ...field, label: newLabel } : field
        );
        setCurrentFormFields(updatedFields);
        onUpdateField(fieldId, newLabel);
    };

    // Обработка удаления поля
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

                    {field.type === 'image' && (
                        <div>
                            <label>
                                Загрузите изображения:
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleImageUpload(field.id, e)}
                                />
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                                {field.answer?.map((image, index) => (
                                    <div key={index} style={{ position: 'relative' }}>
                                        <img
                                            src={image}
                                            alt={`Preview ${index}`}
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {field.type === 'video' && (
                        <div>
                            <label>
                                Загрузите видео:
                                <input
                                    type="file"
                                    accept="video/*"
                                    multiple
                                    onChange={(e) => handleVideoUpload(field.id, e.target.files)}
                                />
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                                {field.answer?.videos?.map((video, index) => (
                                    <div key={index} style={{ position: 'relative' }}>
                                        <video
                                            controls
                                            style={{ width: '150px', height: 'auto' }}
                                        >
                                            <source src={video} type="video/mp4" />
                                            Ваш браузер не поддерживает видео тег.
                                        </video>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button type="button" onClick={() => handleDelete(field.id)}>Удалить поле</button>
                </div>
            ))}
            <button type="button" onClick={handleSaveChangesClick}>Сохранить изменения</button>

            {/* Используем ConfirmationDialog для подтверждения сохранения */}
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