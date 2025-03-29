import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import db from '../../PouchDB/pouchdb';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import Edit_Mode from './Edit_Mode/Edit_Mode' 
import Confirmation_Dialog from '../../components/Confirmation_Dialog/Confirmation_Dialog';
import Form_Header from './Form_Header/Form_Header';
import DisplayModeSection from '../../components/DisplayModeSection/DisplayModeSection';
import AddSelectField from '../New_Form/AddField/AddSelectField';
import AddTextField from '../New_Form/AddField/AddTextField';
import { v4 as uuidv4 } from 'uuid';
import Tag from './Tag/Tag';
import './Form.css';
import FormPreview from '../New_Form/cp_NForm/Preview/FormPreview';

function Form() {
    const { templateId } = useParams();
    const [template, setTemplate] = useState(null);
    const [formData, setFormData] = useState([]);
    const [tableDataArray, setTableDataArray] = useState([])
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();

    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [formTitle, setFormTitle] = useState('');

    const originalFormDataRef = useRef(null);
    const [saveConfirmationMessage, setSaveConfirmationMessage] = useState('');
    const [confirmationDialog, setConfirmationDialog] = useState({
        isOpen: false,
        message: '',
        onConfirm: null,
        onClose: null,
        isConfirmOnly: false
    });


    useEffect(() => {
        const loadTemplate = async () => {
            try {
                const template = await db.get(templateId);
                setTemplate(template);
                if (template && template.formFields && Array.isArray(template.formFields)) {
                    const initialFormData = template.formFields.map(field => ({ ...field, answer: '' }));
                    setFormData(initialFormData);
                    console.log(formData)
                    originalFormDataRef.current = initialFormData;
                } else {
                    console.warn("Template has no formFields, or it's not an array.");
                    setFormData([]);
                    originalFormDataRef.current = [];
                }
                setTableDataArray(template.tableData || []);
            } catch (error) {
                console.error('Error loading template:', error);
            }
        };

        loadTemplate();
    }, [templateId]);

    useEffect(() => {
        if (originalFormDataRef.current) {
            const hasChanges = !arraysAreEqual(formData, originalFormDataRef.current);
            setUnsavedChanges(hasChanges);
        }
    }, [formData]);

    const arraysAreEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i].label !== arr2[i].label || arr1[i].type !== arr2[i].type || arr1[i].options !== arr2[i].options) return false;
        }
        return true;
    };

    const handleInputChange = (fieldId, value) => {
        setFormData(prevData =>
            prevData.map(field =>
                field.id === fieldId ? { ...field, answer: value } : field
            )
        );
    };

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const handleAddField = (newField) => {
        setFormData([...formData, { ...newField, id: uuidv4() }]);
        setUnsavedChanges(true);
    };

    const handleDeleteField = (id) => {
        const updatedFields = formData.filter((field) => field.id !== id);
        setFormData(updatedFields);
        setUnsavedChanges(true);
        setConfirmationDialog({
            isOpen: true,
            message: 'Поле успешно удалено!',
            onClose: null,
            onConfirm: () => setConfirmationDialog({ ...confirmationDialog, isOpen: false }),
            isConfirmOnly: true
        });

    };

    const handleUpdateField = (fieldId, newLabel) => {
        setFormData(prevData =>
            prevData.map(field =>
                field.id === fieldId ? { ...field, label: newLabel } : field
            )
        );
        setUnsavedChanges(true);
    };

    const handleUpdateOptions = (fieldId, newOptions) => {
        setFormData(prevData =>
            prevData.map(field =>
                field.id === fieldId ? { ...field, options: newOptions } : field
            )
        );
        setUnsavedChanges(true);
    };

    const handleAddTable = () => {
        const newTableData = Array(2).fill(null).map(() => Array(2).fill(''));
        setTableDataArray([...tableDataArray, newTableData]);
        setUnsavedChanges(true);
    };

    const handleDeleteTable = (index) => {
        const updatedTableDataArray = [...tableDataArray];
        updatedTableDataArray.splice(index, 1);
        setTableDataArray(updatedTableDataArray);
        setUnsavedChanges(true);
    };

    const handleUpdateTable = (index, newTableData) => {
        const updatedTableDataArray = [...tableDataArray];
        updatedTableDataArray[index] = newTableData;
        setTableDataArray(updatedTableDataArray);
        setUnsavedChanges(true);
    };


    const handleSaveConfirmation = (confirmed) => {
        setShowConfirmationDialog(false);
        if (confirmed) {
            saveEditedTemplateConfirmed();
        }
    };


    const saveEditedTemplate = async () => {
        if (unsavedChanges) {
            setSaveConfirmationMessage("Вы уверены, что хотите сохранить изменения шаблона?");
            setShowConfirmationDialog(true);
        } else {
            setSaveConfirmationMessage("Нет несохраненных изменений.  Все равно сохранить?");
            setShowConfirmationDialog(true);
        }
    };


    const saveEditedTemplateConfirmed = async () => {
        try {
            const currentDoc = await db.get(templateId);
            const updatedTemplate = { 
                ...currentDoc, 
                formFields: formData, 
                tableData: tableDataArray 
            };
            formData.map(value => {
                value.answer = ""
            })
            await db.put(updatedTemplate);
            setConfirmationDialog({
                isOpen: true,
                message: 'Шаблон успешно сохранен!',
                onConfirm: () => setConfirmationDialog({ ...confirmationDialog, isOpen: false, isConfirmOnly: true }),
                onClose: null,
                isConfirmOnly: true
            });
            setIsEditMode(false);
            setUnsavedChanges(false);
            setShowConfirmationDialog(false);
        } catch (error) {
            console.error('Ошибка при сохранении шаблона:', error);
        }
    };

    const handleFormSaveComplete = (formTag, filledFormData) => {
        setConfirmationDialog({
            isOpen: true,
            message: `Анкета "${formTitle}" сохранена с тегом: ${formTag}!`,
            onClose: () => setConfirmationDialog({ ...confirmationDialog, isOpen: false }),
            onConfirm: null,
        });
        navigate('/Saved_Form');
    };


    return (
        <div className="form-container">
            <Header></Header>
            <div style={{ flex: 4 }}>
                <Form_Header
                    templateTitle={template?.title}
                    formTitle={formTitle}
                    setFormTitle={setFormTitle}
                    toggleEditMode={toggleEditMode}
                    isEditMode={isEditMode}
                />

                {isEditMode ? (
                    <>
                        <Edit_Mode
                            formFields={formData}
                            tableDataArray={tableDataArray}
                            onDeleteField={handleDeleteField}
                            onUpdateField={handleUpdateField}
                            onUpdateOptions={handleUpdateOptions}
                            onDeleteTable={handleDeleteTable}
                            onUpdateTable={handleUpdateTable}
                            handleInputChange={handleInputChange}
                        />
                        <AddTextField onAddField={handleAddField} />
                        <AddSelectField onAddField={handleAddField} />
                        <button onClick={handleAddTable}>Добавить таблицу</button>
                        <button onClick={saveEditedTemplate}>Сохранить изменения шаблона</button>
                    </>
                ) : (
                    <DisplayModeSection
                        formData={formData}
                        tableDataArray={tableDataArray}
                        handleInputChange={handleInputChange}
                        onUpdateTable={handleUpdateTable}
                        canEdit={true}
                    />
                )}

                <Tag
                    formTitle={formTitle}
                    formData={formData}
                    templateId={templateId}
                    onComplete={handleFormSaveComplete}
                />

                <Confirmation_Dialog
                    isOpen={showConfirmationDialog}
                    message={saveConfirmationMessage}
                    onConfirm={handleSaveConfirmation}
                    onClose={() => setShowConfirmationDialog(false)}
                />

                <Confirmation_Dialog
                    isOpen={confirmationDialog.isOpen}
                    message={confirmationDialog.message}
                    onClose={confirmationDialog.onClose}
                    onConfirm={confirmationDialog.onConfirm}
                    isConfirmOnly={confirmationDialog.isConfirmOnly}
                />
            </div>
            <Footer></Footer>
        </div>
    );
}

export default Form;