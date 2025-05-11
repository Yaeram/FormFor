import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import db from '../../PouchDB/pouchdb';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import Edit_Mode from './cp_Form/Edit_Mode/Edit_Mode' 
import Confirmation_Dialog from './cp_Form/Confirmation_Dialog/Confirmation_Dialog';
import Form_Header from './cp_Form/Form_Header/Form_Header';
import DisplayModeSection from './cp_Form/DisplayModeSection/DisplayModeSection';
import AddSelectField from '../New_Form/cp_NForm/Form/AddSelectField';
import AddTextField from '../New_Form/cp_NForm/Form/AddTextField';
import AddTable from '../New_Form/cp_NForm/Form/AddTable';
import { v4 as uuidv4 } from 'uuid';
import Tag from './cp_Form/Tag/Tag';
import './Form.css';

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
                const localTemplate = await db.get(templateId);
                console.log('Загружено из локальной бд:', localTemplate)
                setTemplate(localTemplate);

                if (localTemplate && localTemplate.formFields && Array.isArray(localTemplate.formFields)) {
                    const initialFormData = localTemplate.formFields.map(field => ({ ...field, answer: '' }));
                    setFormData(initialFormData);
                    originalFormDataRef.current = initialFormData;
                } else {
                    console.warn("Template has no formFields, or it's not an array.");
                    setFormData([]);
                    originalFormDataRef.current = [];
                }

                setTableDataArray(localTemplate.tableData || []);
            } catch (error) {
                console.error('Ошибка при загрузке шаблона из локальной базы:', error);
            }

            try {
                const response = await fetch(`http://localhost:8000/templates/${templateId}`);
                if (!response.ok) {
                    throw new Error(`Ошибка при загрузке с сервера: ${response.status}`);
            }

            const serverTemplate = await response.json();
            console.log('Загружено с сервера:', serverTemplate);
            } catch (error) {
                console.error('Ошибка при загрузке шаблона с сервера:', error);
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
        console.log(formData)
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

    const handleUpdateTableName = (tableIndex, newName) => {
        setTableDataArray(prev => 
            prev.map((table, index) => 
                index === tableIndex 
                    ? { ...table, tableName: newName } 
                    : table
            )
        );
        setUnsavedChanges(true)
    };

    const handleAddTable = (newTableData) => {
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
    const clearedFormData = formData.map(field => ({
      ...field,
      answer: ""
    }));

    const updatedTemplate = {
      ...currentDoc,
      formFields: clearedFormData,
      tableData: tableDataArray
    };
    await db.put(updatedTemplate);
    const response = await fetch(`http://localhost:8000/templates/${templateId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        _id: updatedTemplate._id,
        _rev: updatedTemplate._rev,
        title: updatedTemplate.title,
        type: updatedTemplate.type,
        tag: updatedTemplate.tag,
        createdAt: updatedTemplate.created_at || Date.now(),
        formFields: clearedFormData,
        tableData: tableDataArray
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Ошибка при сохранении на сервере");
    }

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

    const handleFormSaveComplete = (formTag) => {
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
            <div className='form-content'>
                <Form_Header
                    templateTitle={template?.title}
                    formTitle={formTitle}
                    setFormTitle={setFormTitle}
                    toggleEditMode={toggleEditMode}
                    isEditMode={isEditMode}
                />

                {isEditMode ? (
                    <>
                        <div className='edit-mode-layout'>
                            <Edit_Mode
                            templateTitle={template?.title}
                            formFields={formData}
                            tableDataArray={tableDataArray}
                            onDeleteField={handleDeleteField}
                            onUpdateField={handleUpdateField}
                            onUpdateOptions={handleUpdateOptions}
                            onDeleteTable={handleDeleteTable}
                            onUpdateTable={handleUpdateTable}
                            onUpdateTableName={handleUpdateTableName}
                            handleInputChange={handleInputChange}
                            />
                            <div className='edit-mode-add-fields'>
                                <AddTextField onAddField={handleAddField} />
                                <AddSelectField onAddField={handleAddField} />
                                <AddTable handleAddTable={handleAddTable}></AddTable>
                            </div>
                        </div>
                        
                        <button onClick={saveEditedTemplate} className='save-template-button'>Сохранить изменения шаблона</button>
                    </>
                ) : (
                    <>
                        <DisplayModeSection
                            templateTitle={template?.title}
                            formData={formData}
                            tableDataArray={tableDataArray}
                            handleInputChange={handleInputChange}
                            onUpdateTable={handleUpdateTable}
                            canEdit={true}
                        />
                        <Tag
                        defaultTitle={template?.title}
                        formTitle={formTitle}
                        formData={formData}
                        tableDataArray={tableDataArray}
                        templateId={templateId}
                        onComplete={handleFormSaveComplete}
                        />
                    </>     
                )}

                

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