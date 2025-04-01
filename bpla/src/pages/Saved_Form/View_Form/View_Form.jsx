// View_Form.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import db from '../../../PouchDB/pouchdb';
import DisplayModeSection from '../../Form/cp_Form/DisplayModeSection/DisplayModeSection';
import EditSavedForm from '../EditSavedForm/EditSavedForm';
import './View_Form.css';
import { Header } from '../../../components/Header/Header';
import { Footer } from '../../../components/Footer/Footer';

function View_Form() {
    const { formId } = useParams();
    const [formData, setFormData] = useState(null);
    const [tableDataArray, setTableDataArray] = useState([]);
    const [formTitle, setFormTitle] = useState('');
    const [formTag, setFormTag] = useState('');
    const [formCreatedAt, setFormCreatedAt] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const loadFormData = async () => {
            try {
                let initialFormData = [];
                let initialTableData = [];
                let form;

                if (location.state && location.state.formData) {
                    initialFormData = location.state.formData;
                    initialTableData = location.state.tableData || [];
                    setFormTitle(location.state.title || '');
                    setFormTag(location.state.tag || '');
                    setFormCreatedAt(location.state.createdAt || new Date());
                    console.log("View_Form: Received data from location.state:", location.state);
                } else {
                    form = await db.get(formId);
                    console.log("View_Form: Loaded form from PouchDB:", form);
                    initialFormData = form.formFields || [];
                    initialTableData = form.tableData || [];
                    setFormTitle(form.title || '');
                    setFormTag(form.tag || '');
                    setFormCreatedAt(form.createdAt || new Date());
                }

                setFormData(initialFormData);
                setTableDataArray(initialTableData);
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

    const handleSaveChanges = async () => {
        try {
            const doc = await db.get(formId);
            const updatedDoc = {
                ...doc,
                formFields: formData,
                tableData: tableDataArray,
                updatedAt: new Date()
            };
            
            await db.put(updatedDoc);
            console.log('Form updated successfully:', updatedDoc);
            setIsEditMode(false);
            
            // Обновляем состояние, чтобы изменения сразу отобразились
            setFormData([...formData]);
            setTableDataArray([...tableDataArray]);
        } catch (error) {
            console.error('Error saving form:', error);
        }
    };

    if (!formData) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="view-form-page">
            <Header></Header>
            <div className="view-form-container">
                
                <h1>{formTitle}</h1>
                <p>Тег: {formTag}</p>
                {formCreatedAt && (
                    <p>Дата создания: {new Date(formCreatedAt).toLocaleString()}</p>
                )}

                {!isEditMode ? (
                    <>
                        <button onClick={() => setIsEditMode(true)}>Редактировать форму</button>
                        <DisplayModeSection 
                            formData={formData} 
                            canEdit={false} 
                            tableDataArray={tableDataArray}
                        />
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsEditMode(false)}>Отменить редактирование</button>
                        <EditSavedForm
                            formFields={formData}
                            onUpdateField={handleUpdateField}
                            onUpdateOptions={handleUpdateOptions}
                            onDeleteField={handleDeleteField}
                            onUpdateAnswer={handleUpdateAnswer}
                            saveChanges={handleSaveChanges}
                        />
                    </>
                )}
            </div>
            <Footer></Footer>
        </div>
        
    );
}

export default View_Form;