import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddSelectField from './cp_NForm/Form/AddSelectField';
import AddTextField from './cp_NForm/Form/AddTextField';
import FormPreview from './cp_NForm/Preview/FormPreview';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import './New_Form.css';
import { v4 as uuidv4 } from 'uuid';
import db from '../../PouchDB/pouchdb';


function New_Form() {
    const [formFields, setFormFields] = useState([]);
    const navigate = useNavigate();
    const [templateTitle, setTemplateTitle] = useState(''); // Добавляем состояние для названия шаблона

    // Функция для генерации случайного тега
    const generateTag = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let tag = '';
        for (let i = 0; i < 4; i++) {
            tag += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return tag;
    };

    const addField = (newField) => {
        setFormFields([...formFields, { ...newField, id: uuidv4() }]);
    };

    const saveTemplate = async () => {
        try {
            const templateTag = generateTag(); // Генерируем тег
            const templateData = {
                _id: `template_${uuidv4()}`,
                title: templateTitle, // Сохраняем название шаблона
                formFields: formFields || [],
                type: 'template',
                tag: templateTag, // Сохраняем тег
                createdAt: Date.now() // Добавляем дату и время создания
            };
            console.log('templateData before saving:', templateData); // Добавьте эту строку
            await db.put(templateData);
            alert(`Шаблон анкеты "${templateTitle}" сохранен с тегом: ${templateTag}!`);
            navigate('/Form_Template'); // Перенаправляем на FormTemplate
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    return (
        <div className="new-form-container">
            <Header></Header>
            <div style={{flex: 4}}>
                <h2>Создать новый шаблон анкеты</h2>
                <div className="new-form-content"> {/* Add this element */}
                    <div className="new-form-creation"> {/* Add this element */}
                        <label>
                            Название шаблона:
                            <input
                                type="text"
                                value={templateTitle}
                                onChange={(e) => setTemplateTitle(e.target.value)}
                            />
                        </label>
                        <AddTextField onAddField={addField} />
                        <AddSelectField onAddField={addField} />
                    </div>  {/* End left side */}

                    {/* Form Preview */}
                    <div className="form-preview-container">
                        <h3>Предварительный просмотр:</h3>
                        <FormPreview formFields={formFields} />
                    </div> {/* End right side */}
                </div> {/* End content */}

                <button onClick={saveTemplate}>Сохранить шаблон</button>
            </div>
            <Footer></Footer>
        </div>
    );
}

export default New_Form;