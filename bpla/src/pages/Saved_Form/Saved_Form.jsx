import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import db from '../../PouchDB/pouchdb';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import './Saved_Form.css';
import Confirmation_Dialog from '../Form/cp_Form/Confirmation_Dialog/Confirmation_Dialog';
import * as mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';

function Saved_Form() {
    const [savedForms, setSavedForms] = useState([]);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [formToDelete, setFormToDelete] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadSavedForms = async () => {
            try {
                const forms = await db.allDocs({
                    include_docs: true,
                    startkey: 'form_',
                    endkey: 'form_\uffff'
                });
                const sortedForms = forms.rows.map(row => row.doc).sort((a, b) => b.createdAt - a.createdAt);
                setSavedForms(sortedForms);
            } catch (error) {
                console.error('Error loading saved forms:', error);
            }
        };

        loadSavedForms();
    }, []);

    const generateTag = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let tag = '';
        for (let i = 0; i < 4; i++) {
            tag += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return tag;
    };

    const handleDeleteForm = async (formId) => {
        setFormToDelete(formId);
        setShowConfirmationDialog(true);
    };

    const handleConfirmation = async (confirmed) => {
        setShowConfirmationDialog(false);
        if (confirmed) {
            try {
                await db.get(formToDelete).then(doc => db.remove(doc));
                const updatedForms = savedForms.filter(form => form._id !== formToDelete);
                setSavedForms(updatedForms);
                alert('Анкета успешно удалена!');
            } catch (error) {
                console.error('Error deleting form:', error);
                alert('Ошибка при удалении анкеты!');
            }
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                const result = await mammoth.extractRawText({ arrayBuffer });
                const text = result.value;
                
                // Парсим текст документа
                const parsedForm = parseWordDocument(text, file.name);
                
                // Сохраняем в PouchDB
                await db.put(parsedForm);
                
                // Обновляем список форм
                const forms = await db.allDocs({
                    include_docs: true,
                    startkey: 'form_',
                    endkey: 'form_\uffff'
                });
                const sortedForms = forms.rows.map(row => row.doc).sort((a, b) => b.createdAt - a.createdAt);
                setSavedForms(sortedForms);
                
                alert('Документ успешно загружен и сохранен!');
            } catch (error) {
                console.error('Error processing Word document:', error);
                alert('Ошибка при обработке документа!');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const parseWordDocument = (text, filename) => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        console.log(lines)
        
        const newForm = {
            _id: `form_${uuidv4()}`,
            templateId: undefined,
            type: "form",
            title: filename,
            tag: generateTag(),
            createdAt: Date.now(),
            _rev: undefined,
            formFields: []
        };

        // Регулярные выражения для извлечения данных
        const objectRegex = /Объект испытаний:(.+)/;
        const customerRegex = /Заказчик:(.+)/;
        const basisRegex = /Основание проведение испытаний:(.+)/;
        const purposeRegex = /1\.\s*Цель испытаний:(.+)/;
        const placeRegex = /2\.\s*Место проведения испытаний:(.+)/;
        const startDateRegex = /3\.\s*Дата и время начала проведения испытаний:(.+)/;
        const endDateRegex = /4\.\s*Дата и время окончания проведения испытаний:(.+)/;
        const weatherRegex = /5\.\s*Метеоусловия при проведении испытаний:(.+)/;
        const equipmentRegex = /6\.\s*Комплектность представляемого на тестовые испытания объекта:([\s\S]+?)(?=\d+\.\s+Результаты испытаний:)/;
        const resultsRegex = /7\.\s*Результаты испытаний:([\s\S]+?)(?=\d+\.\s+Замечания и рекомендации)/;
        const remarksRegex = /8\.\s*Замечания и рекомендации([\s\S]+?)(?=\d+\.\s+Выводы:)/;
        const conclusionsRegex = /9\.\s*Выводы:(.+)/;

        // Извлекаем данные из текста
        lines.forEach(line => {
            if (objectRegex.test(line)) {
                newForm.formFields.push({
                    label: "Объект испытаний",
                    type: "text",
                    value: "",
                    id: `field_${Date.now()}_1`,
                    answer: line.match(objectRegex)[1].trim()
                });
            } else if (customerRegex.test(line)) {
                newForm.formFields.push({
                    label: "Заказчик",
                    type: "text",
                    value: "",
                    id: `field_${Date.now()}_2`,
                    answer: line.match(customerRegex)[1].trim()
                });
            } else if (basisRegex.test(line)) {
                newForm.formFields.push({
                    label: "Основание проведения испытаний",
                    type: "text",
                    value: "",
                    id: `field_${Date.now()}_3`,
                    answer: line.match(basisRegex)[1].trim()
                });
            }
        });

        // Обработка полей с нумерацией
        const fullText = lines.join('\n');
        
        if (purposeRegex.test(fullText)) {
            newForm.formFields.push({
                label: "Цель испытаний",
                type: "text",
                value: "",
                id: `field_${Date.now()}_4`,
                answer: fullText.match(purposeRegex)[1].trim()
            });
        }
        
        if (placeRegex.test(fullText)) {
            newForm.formFields.push({
                label: "Место проведения испытаний",
                type: "text",
                value: "",
                id: `field_${Date.now()}_5`,
                answer: fullText.match(placeRegex)[1].trim()
            });
        }
        
        if (startDateRegex.test(fullText)) {
            newForm.formFields.push({
                label: "Дата и время начала проведения испытаний",
                type: "text",
                value: "",
                id: `field_${Date.now()}_6`,
                answer: fullText.match(startDateRegex)[1].trim()
            });
        }
        
        if (endDateRegex.test(fullText)) {
            newForm.formFields.push({
                label: "Дата и время окончания проведения испытаний",
                type: "text",
                value: "",
                id: `field_${Date.now()}_7`,
                answer: fullText.match(endDateRegex)[1].trim()
            });
        }
        
        if (weatherRegex.test(fullText)) {
            newForm.formFields.push({
                label: "Метеоусловия при проведении испытаний",
                type: "text",
                value: "",
                id: `field_${Date.now()}_8`,
                answer: fullText.match(weatherRegex)[1].trim()
            });
        }

        // Обработка комплектности
        if (equipmentRegex.test(fullText)) {
            const equipmentText = fullText.match(equipmentRegex)[1].trim();
            newForm.formFields.push({
                label: "Комплектность представляемого на тестовые испытания объекта",
                type: "text",
                value: "",
                id: `field_${Date.now()}_9`,
                answer: equipmentText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            });
        }

        // Обработка результатов испытаний
        if (resultsRegex.test(fullText)) {
            const resultsText = fullText.match(resultsRegex)[1].trim();
            newForm.formFields.push({
                label: "Результаты испытаний",
                type: "text",
                value: "",
                id: `field_${Date.now()}_10`,
                answer: resultsText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            });
        }

        // Обработка замечаний и рекомендаций
        if (remarksRegex.test(fullText)) {
            const remarksText = fullText.match(remarksRegex)[1].trim();
            newForm.formFields.push({
                label: "Замечания и рекомендации",
                type: "text",
                value: "",
                id: `field_${Date.now()}_11`,
                answer: remarksText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            });
        }

        // Обработка выводов
        if (conclusionsRegex.test(fullText)) {
            newForm.formFields.push({
                label: "Выводы",
                type: "text",
                value: "",
                id: `field_${Date.now()}_12`,
                answer: fullText.match(conclusionsRegex)[1].trim()
            });
        }

        return newForm;
    };

    return (
        <div className="saved-forms-container">
            <Header></Header>
            <div className='saved-form-content'>
                <h1>Сохраненные анкеты</h1>
                
                <div className="upload-section">
                    <label htmlFor="word-upload" className="upload-button">
                        Загрузить Word документ
                    </label>
                    <input
                        id="word-upload"
                        type="file"
                        accept=".docx"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </div>
                
                <input
                    type="text"
                    placeholder="Поиск по тегу или названию"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                
                <div className="forms-list">
                    {savedForms
                        .filter(form =>
                            form.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            form.title.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((form) => (
                            <div key={form._id} className="form-card">
                                <h2>{form.title}</h2>
                                <p>Тег: {form.tag}</p>
                                <p>Дата создания: {new Date(form.createdAt).toLocaleString()}</p>
                                <div className="form-actions">
                                    <Link 
                                        to={{
                                            pathname: `/view/${form._id}`,
                                            state: { formData: form }
                                        }}
                                        className="view-button"
                                    >
                                        Посмотреть
                                    </Link>
                                    <button 
                                        onClick={() => handleDeleteForm(form._id)}
                                        className="delete-button"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>

                <Confirmation_Dialog
                    isOpen={showConfirmationDialog}
                    message={'Вы уверены, что хотите удалить анкету?'}
                    onConfirm={() => handleConfirmation(true)}
                    onClose={() => setShowConfirmationDialog(false)}
                />
            </div>
            <Footer></Footer>
        </div>
    );
}

export default Saved_Form;