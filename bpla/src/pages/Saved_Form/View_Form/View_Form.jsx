// View_Form.js
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
    

    useEffect(() => {  
        const loadFormData = async () => {
            try {
                let initialFormData = [];
                let initialTableData = [];
                let form;

                if (location.state && location.state.formData) {
                    initialFormData = location.state.formData.formFields;
                    initialTableData = location.state.formData.tableData || [];
                    setFormTitle(location.state.formData.title || '');
                    setFormTag(location.state.formData.tag || '');
                    setFormCreatedAt(location.state.formData.createdAt || new Date());
                    console.log("View_Form: Received data from location.state:", initialFormData);
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

    const handleUpdateTableName = (tableIndex, newName) => {
        setTableDataArray(prev => 
            prev.map((table, index) => 
                index === tableIndex 
                    ? { ...table, tableName: newName } 
                    : table
            )
        );
    };


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

    const handleTableChange = (index, newTableData) => {
        const updatedTableDataArray = [...tableDataArray];
        updatedTableDataArray[index] = newTableData;
        setTableDataArray(updatedTableDataArray);
    };
    

  const handleSaveChanges = async () => {
  try {
    const isConnected = localStorage.getItem('connected') === 'true';
    const isAuthorized = localStorage.getItem('authorized') === 'true';
    const username = localStorage.getItem('username');

    const doc = await db.get(formId);
    const updatedDoc = {
      ...doc,
      formFields: formData,
      tableData: tableDataArray,
      username: username
    };

    await db.put(updatedDoc);
    console.log('Form updated locally:', updatedDoc);

    if (isConnected && isAuthorized) {
      try {
        const serverData = {
          _id: updatedDoc._id,
          templateId: updatedDoc.templateId,
          title: updatedDoc.title,
          type: updatedDoc.type,
          tag: updatedDoc.tag,
          createdAt: updatedDoc.createdAt, 
          formFields: updatedDoc.formFields,
          tableData: updatedDoc.tableData,
          _rev: updatedDoc._rev,
          username: updatedDoc.username
        };

        const response = await fetch(`http://localhost:8000/forms/${formId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serverData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server validation errors:', errorData.detail);
          throw new Error('Ошибка сервера при обновлении формы');
        }

        console.log('Form successfully updated on server');
        alert('Изменения сохранены и синхронизированы с сервером');
      } catch (serverError) {
        console.error('Server sync error:', serverError);
        alert('Изменения сохранены локально, но не синхронизированы с сервером');
      }
    } else {
      console.log('No connection - saved locally only');
      alert('Изменения сохранены локально (синхронизация при подключении)');
    }

    setIsEditMode(false);
    setFormData([...formData]);
    setTableDataArray([...tableDataArray]);

  } catch (error) {
    console.error('Error saving form:', error);
    alert(`Ошибка при сохранении: ${error.message}`);
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
                            onUpdateTable={handleTableChange}
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
                            tableDataArray={tableDataArray}
                            handleTableLabelChange={handleUpdateTableName}
                            onUpdateTable={handleTableChange}
                        />
                    </>
                )}
            </div>
            <Footer></Footer>
        </div>
        
    );
}

export default View_Form;