import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddSelectField from './cp_NForm/Form/AddSelectField';
import AddTextField from './cp_NForm/Form/AddTextField';
import FormPreview from './cp_NForm/Preview/FormPreview';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import './New_Form.css';
import { v4 as uuidv4 } from 'uuid';
import db from '../../PouchDB/pouchdb';
import AddTable from './cp_NForm/Form/AddTable';

function New_Form() {
    const [formFields, setFormFields] = useState([]);
    const [tableDataArray, setTableDataArray] = useState([]);
    const navigate = useNavigate();
    const [templateTitle, setTemplateTitle] = useState('');
    //
    const generateTag = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let tag = '';
        for (let i = 0; i < 4; i++) {
            tag += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return tag;
    };

    const handleAddTable = (newTableData) => {
        setTableDataArray([...tableDataArray, newTableData]);
    };

    const handleTableChange = (index, newTableData) => {
        const newTableDataArray = [...tableDataArray];
        newTableDataArray[index].tableData = newTableData;
        setTableDataArray(newTableDataArray);
    };

    const handleDeleteTable = (index) => {
        const newTableDataArray = [...tableDataArray];
        newTableDataArray.splice(index, 1);
        setTableDataArray(newTableDataArray);
    };

    const addField = (newField) => { 
        let initialValue = '';
        if (newField.type === 'image' || newField.type === 'video') {
            initialValue = null;
        }
        setFormFields([...formFields, { ...newField, id: uuidv4(), value: initialValue }]);
    };

    const handleFileChange = (fieldId, file) => {
        if (!file) {
            setFormFields(prevFields =>
                prevFields.map(field =>
                    field.id === fieldId ? { ...field, value: null } : field
                )
            );
            return;
        }
        const reader = new FileReader();

        reader.onload = (e) => {
            setFormFields(prevFields =>
                prevFields.map(field =>
                    field.id === fieldId ? { ...field, value: e.target.result } : field
                )
            );
        };

        reader.readAsDataURL(file);
    };

    const handleDeleteField = (id) => {
        setFormFields(formFields.filter(field => field.id !== id));
    };

    const saveTemplate = async () => {
        try {
            const templateTag = generateTag();
            const templateData = {
                _id: `template_${uuidv4()}`,
                title: templateTitle,
                formFields: formFields || [],
                tableData: tableDataArray,
                type: 'template',
                tag: templateTag,
                createdAt: Date.now(),
            };

            console.log("Saving template data:", templateData);

            const response = await db.put(templateData);
        
            const dataWithRev = {
                ...templateData,
                _rev: response.rev
            };
            
            try {
                const response = await axios.post(
                    'http://localhost:8000/templates/', 
                    dataWithRev,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                console.log('Успешно сохранено на удаленный сервер:', response.data);
            } catch (apiError) {
                console.error('Не удалось сохранить на удаленный сервер:', apiError);
                alert(`Шаблон сохранен локально, но возникла ошибка при сохранении на сервер`);
            }

            alert(`Шаблон анкеты "${templateTitle}" сохранен с тегом: ${templateTag}!`);
            navigate('/Form_Template');
        } catch (error) {
            console.error('Error saving template:', error);
            alert(`Ошибка при сохранении шаблона: ${error.message}`);
        }
    };

    return (
        <div className="new-template-page">
            <Header />
            <div className='new-template-container'>
                <h2>Создать новый шаблон анкеты</h2>
                <div className="new-form-content">
                    <div className="new-form-creation">
                        <label>
                            Название шаблона:
                            <input
                                type="text"
                                value={templateTitle}
                                onChange={(e) => setTemplateTitle(e.target.value)}
                            />
                        </label>
                        <div className='new-form-creation-fields'>
                            <AddTextField onAddField={addField} />
                            <AddSelectField onAddField={addField} />
                            <AddTable handleAddTable={handleAddTable}/>
                        </div>                      
                    </div>
                    <FormPreview
                        formFields={formFields}
                        tableDataArray={tableDataArray}
                        onDeleteField={handleDeleteField}
                        onDeleteTable={handleDeleteTable}
                        handleFileChange={handleFileChange}
                        onTableChange={handleTableChange}
                        templateTitle={templateTitle}
                    />
                </div>
                <button onClick={saveTemplate}>Сохранить шаблон</button>
            </div>
            <Footer />
        </div>
    );
}

export default New_Form;

