import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Импортируем useParams
import db from '../../PouchDB/pouchdb';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import Edit_Mode from '../Form/cp_Form/Edit_Mode/Edit_Mode' 
import Confirmation_Dialog from './cp_Form/Confirmation_Dialog/Confirmation_Dialog';
import Form_Header from './cp_Form/Form_Header/Form_Header';
import DisplayModeSection from './cp_Form/DisplayModeSection/DisplayModeSection';
import AddSelectField from '../New_Form/cp_NForm/Form/AddSelectField';
import AddTextField from '../New_Form/cp_NForm/Form/AddTextField';
import { v4 as uuidv4 } from 'uuid';
import Form_Field from './cp_Form/Form_Field/Form_Field';
import Tag from './cp_Form/Tag/Tag';
import './Form.css';

function Form() {
    const { templateId } = useParams();
    const [template, setTemplate] = useState(null);
    const [formData, setFormData] = useState([]);
    const [initialFormData, setInitialFormData] = useState([]);
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
    });
  
  
    useEffect(() => {
      const loadTemplate = async () => {
        try {
          const template = await db.get(templateId);
          setTemplate(template);
          if (template && template.formFields && Array.isArray(template.formFields)) {
            setFormData(template.formFields.map(field => ({ ...field, value: '' })));
            setInitialFormData(template.formFields.map(field => ({ ...field, value: '' })));
            originalFormDataRef.current = template.formFields.map(field => ({ ...field, value: '' }));
          } else {
            console.warn("Template has no formFields, or it's not an array.");
            setFormData([]);
            setInitialFormData([]);
            originalFormDataRef.current = [];
          }
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
  
    const handleInputChange = (id, value) => {
      setFormData(prevData =>
        prevData.map(field =>
          field.id === id ? { ...field, value: value } : field
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
        onClose: () => setConfirmationDialog({ ...confirmationDialog, isOpen: false }),
        onConfirm: null,
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
        const updatedTemplate = { ...template, formFields: formData };
        await db.put(updatedTemplate);
  
        //alert('Шаблон успешно сохранен!');
        setConfirmationDialog({
          isOpen: true,
          message: 'Шаблон успешно сохранен!',
          onClose: () => setConfirmationDialog({ ...confirmationDialog, isOpen: false }),
          onConfirm: null,
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
      navigate('/saved');
    };
  
  
    return (
      <div className="form-container">
        <Header></Header>
        <div style={{flex: 4}}>
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
                onDeleteField={handleDeleteField}
                onUpdateField={handleUpdateField}
                onUpdateOptions={handleUpdateOptions}
                />
                {/* Render AddTextField and AddSelectField here */}
                <AddTextField onAddField={handleAddField} />
                <AddSelectField onAddField={handleAddField} />
                <button onClick={saveEditedTemplate}>Сохранить изменения шаблона</button>
            </>
            ) : (
            <DisplayModeSection
                formData={formData}
                handleInputChange={handleInputChange}
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
    
            {/* Use ConfirmationDialog for notifications */}
            <Confirmation_Dialog
            isOpen={confirmationDialog.isOpen}
            message={confirmationDialog.message}
            onClose={confirmationDialog.onClose}
            onConfirm={confirmationDialog.onConfirm}
            />
        </div>
        <Footer></Footer>
      </div>
    );
  }
  
  export default Form;