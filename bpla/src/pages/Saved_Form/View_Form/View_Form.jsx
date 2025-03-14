import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import db from '../../../PouchDB/pouchdb';
import DisplayModeSection from '../../Form/cp_Form/DisplayModeSection/DisplayModeSection';
import EditSavedForm from '../EditSavedForm/EditSavedForm';
import './View_Form.css';

function View_Form() {
    const { formId } = useParams();
    const [formData, setFormData] = useState(null);
    const [tableDataArray, setTableDataArray] = useState([]);
    const [formTitle, setFormTitle] = useState('');
    const [formTag, setFormTag] = useState('');
    const [formCreatedAt, setFormCreatedAt] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const loadFormData = async () => {
            try {
                let initialFormData = [];
                let initialTableData = [];

                if (location.state && location.state.formData && location.state.tableData) {
                    initialFormData = location.state.formData;
                    initialTableData = location.state.tableData;
                    console.log("View_Form: Received data from location.state:", location.state);
                    setFormData(initialFormData);
                    setTableDataArray(initialTableData);
                } else {
                    const form = await db.get(formId);
                    console.log("View_Form: Loaded form from PouchDB:", form);
                    initialFormData = form.formFields;
                    initialTableData = form.tableData;
                    setFormData(initialFormData);
                    setTableDataArray(initialTableData);
                    setFormTitle(form.title);
                    setFormTag(form.tag);
                    setFormCreatedAt(form.createdAt);
                }
            } catch (error) {
                console.error('Error loading form data:', error);
            }
        };

        loadFormData();
    }, [formId, location.state]);

    const handleUpdateField = (fieldId, newLabel) => {
        setFormData(prevData =>
            prevData.map(field =>
                field.id === fieldId ? { ...field, label: newLabel } : field
            )
        );
    };

    const handleUpdateOptions = (fieldId, newOptions) => {
        setFormData(prevData =>
            prevData.map(field =>
                field.id === fieldId ? { ...field, options: newOptions } : field
            )
        );
    };

    const handleDeleteField = (fieldId) => {
        setFormData(prevData => prevData.filter(field => field.id !== fieldId));
    };

    const handleUpdateAnswer = (fieldId, value) => {
        setFormData(prevData =>
            prevData.map(field =>
                field.id === fieldId ? { ...field, answer: value } : field
            )
        );
    };

    const handleSaveChanges = () => {
        // Сохранение изменений в базу данных или состояние
        console.log('Изменения сохранены:', formData);
        setIsEditMode(false); // Выход из режима редактирования
    };

    if (!formData) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="view-form-container">
            <h1>{formTitle}</h1>
            <p>Тег: {formTag}</p>
            <p>Дата создания: {new Date(formCreatedAt).toLocaleString()}</p>

            {/* Кнопка для перехода в режим редактирования */}
            {!isEditMode && (
                <button onClick={() => setIsEditMode(true)}>Редактировать форму</button>
            )}

            {/* Отображение компонента редактирования или просмотра */}
            {isEditMode ? (
                <EditSavedForm
                    formFields={formData}
                    onUpdateField={handleUpdateField}
                    onUpdateOptions={handleUpdateOptions}
                    onDeleteField={handleDeleteField}
                    onUpdateAnswer={handleUpdateAnswer}
                    saveChanges={handleSaveChanges}
                />
            ) : (
                <DisplayModeSection formData={formData} canEdit={false} />
            )}

            {/* Отображение таблиц */}
            {tableDataArray && tableDataArray.length > 0 && (
                tableDataArray.map((tableData, index) => (
                    <div key={index}>
                        <table>
                            <tbody>
                                {tableData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, colIndex) => (
                                            <td key={colIndex}>
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            )}
        </div>
    );
}

export default View_Form;