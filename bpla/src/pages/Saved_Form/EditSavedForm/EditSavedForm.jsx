import React, { useState, useEffect } from 'react';
import './EditSavedForm.css';
import DisplayModeSection from '../../Form/cp_Form/DisplayModeSection/DisplayModeSection';



function EditSavedForm({ formFields, onUpdateField, onUpdateOptions, onDeleteField, onUpdateAnswer, saveChanges }) {
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [previewFormData, setPreviewFormData] = useState([...formFields]);
    const [currentFormFields, setCurrentFormFields] = useState([...formFields]);

    useEffect(() => {
        setPreviewFormData([...currentFormFields]); // Update previewFormData whenever currentFormFields changes
    }, [currentFormFields]);

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
        setPreviewFormData([...currentFormFields]); //Update preview
        setIsConfirmationOpen(true);
    };

    const handleConfirmSave = () => {
        // Call the saveChanges function passed from View_Form
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


    return (
        <div className="edit-saved-form-container">
            {formFields && currentFormFields.map(field => (
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

                    <button type="button" onClick={() => onDeleteField(field.id)}>Удалить поле</button>
                </div>
            ))}
            <button type="button" onClick={handleSaveChangesClick}>Сохранить изменения</button>

            {isConfirmationOpen && (  // Render confirmation modal
                <div className="modal">
                    <div className="modal-content">
                        <h2>Предварительный просмотр</h2>
                        <DisplayModeSection formData={previewFormData} handleInputChange={() => { }} />
                        <p>Вы уверены, что хотите сохранить изменения?</p>
                        <button type="button" onClick={handleConfirmSave}>Сохранить</button>
                        <button type="button" onClick={handleCancelSave}>Отмена</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditSavedForm;

// function EditSavedForm({ formFields, onUpdateField, onUpdateOptions, onDeleteField, onUpdateAnswer }) {
//     const handleAddOption = (fieldId) => {
//         onUpdateOptions(fieldId, [...formFields.find(f => f.id === fieldId).options, '']);
//     };

//     const handleOptionChange = (fieldId, index, value) => {
//         const newOptions = [...formFields.find(f => f.id === fieldId).options];
//         newOptions[index] = value;
//         onUpdateOptions(fieldId, newOptions);
//     };

//     const handleRemoveOption = (fieldId, index) => {
//         const newOptions = [...formFields.find(f => f.id === fieldId).options];
//         newOptions.splice(index, 1);
//         onUpdateOptions(fieldId, newOptions);
//     };

//     const handleAnswerChange = (fieldId, value) => {
//         onUpdateAnswer(fieldId, value);
//     };

//     return (
//         <div className="edit-saved-form-container">
//             {formFields && formFields.map(field => (
//                 <div key={field.id} className="edit-saved-form-field">
//                     <label>
//                         Метка поля:
//                         <input
//                             type="text"
//                             value={field.label}
//                             onChange={(e) => onUpdateField(field.id, e.target.value)}
//                         />
//                     </label>

//                     {field.type === 'text' && (
//                         <label>
//                             Ответ:
//                             <input
//                                 type="text"
//                                 value={field.answer || ''}
//                                 onChange={(e) => handleAnswerChange(field.id, e.target.value)}
//                             />
//                         </label>
//                     )}

//                     {field.type === 'select' && (
//                         <div>
//                             <label>Опции:</label>
//                             <select
//                                 value={field.answer || ''}
//                                 onChange={(e) => handleAnswerChange(field.id, e.target.value)}
//                             >
//                                 <option value="">Выберите значение</option>
//                                 {field.options && field.options.map((option, index) => (
//                                     <option key={index} value={option}>{option}</option>
//                                 ))}
//                             </select>

//                             {field.options && field.options.map((option, index) => (
//                                 <div key={index} className="option-row">
//                                     <input
//                                         type="text"
//                                         value={option}
//                                         onChange={(e) => handleOptionChange(field.id, index, e.target.value)}
//                                     />
//                                     <button type="button" onClick={() => handleRemoveOption(field.id, index)}>
//                                         Удалить
//                                     </button>
//                                 </div>
//                             ))}
//                             <button type="button" onClick={() => handleAddOption(field.id)}>
//                                 Добавить опцию
//                             </button>
//                         </div>
//                     )}

//                     <button type="button" onClick={() => onDeleteField(field.id)}>Удалить поле</button>
//                 </div>
//             ))}
//         </div>
//     );
// }

// export default EditSavedForm;