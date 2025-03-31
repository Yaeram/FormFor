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
        const files = Array.from(event.target.files);
        if (!files.length) return;
    
        try {
            const uploadPromises = files.map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            const arrayBuffer = e.target.result;
                            const result = await mammoth.extractRawText({ arrayBuffer });
                            const text = result.value;
                            const parsedForm = parseWordDocument(text, file.name);
                            await db.put(parsedForm);
                            resolve();
                        } catch (error) {
                            console.error('Error processing Word document:', error);
                            reject(error);
                        }
                    };
                    reader.onabort = () => reject(new Error('File reading was aborted'));
                    reader.onerror = () => reject(new Error('File reading failed'));
                    reader.readAsArrayBuffer(file);
                });
            });
    
            await Promise.all(uploadPromises);
    
            const forms = await db.allDocs({
                include_docs: true,
                startkey: 'form_',
                endkey: 'form_\uffff'
            });
            const sortedForms = forms.rows.map(row => row.doc).sort((a, b) => b.createdAt - a.createdAt);
            setSavedForms(sortedForms);
    
            alert(`Успешно загружено ${files.length} документ(ов). Анкеты созданы.`);
        } catch (error) {
            console.error('Не удалось обработать документы:', error);
            alert('Ошибка при обработке документов. Часть файлов могла не загрузиться.');
        } finally {
            event.target.value = '';
        }
    };
    
    const parseWordDocument = (text, filename) => {
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
    
        // Улучшенная нормализация текста
        const normalizedText = text.replace(/\n+/g, '\n').replace(/\r/g, '').trim();
    
        // Более точные регулярные выражения с явными границами
        const regexPatterns = {
            object: /Объект испытаний:\s*([^\n]+)/i,
            customer: /Заказчик:\s*([^\n]+)/i,
            basis: /Основание проведение испытаний:\s*([^\n]+)/i,
            purpose: /Цель испытаний:\s*([^\n]+)/i,
            place: /Место проведения испытаний:\s*([^\n]+)/i,
            startDate: /Дата и время начала проведения испытаний:\s*([^\n]+)/i,
            endDate: /Дата и время окончания проведения испытаний:\s*([^\n]+)/i,
            weather: /Метеоусловия при проведении испытаний:\s*([^\n]+)/i,
            equipment: /Комплектность представляемого на тестовые испытания объекта:\s*([\s\S]+?)(?=\n\d+\.|\n7\.)/i,
            results: /Результаты испытаний:\s*([\s\S]+?)(?=\n\s*Замечания и рекомендации|$)/i,
            remarks: /Замечания и рекомендации\s*\n([\s\S]+?)(?=\n\s*Выводы|$)/i,
            conclusions: /Выводы:\s*([\s\S]+)/i
        };
    
        // Функция для очистки и нормализации текста
        const cleanText = (text) => {
            return text
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/\s*,\s*/g, ', ')
                .replace(/\s*\.\s*/g, '. ')
                .replace(/\s*:\s*/g, ': ')
                .trim();
        };
    
        // Извлекаем данные по всем полям
        const extractField = (label, pattern, idSuffix) => {
            const match = normalizedText.match(pattern);
            if (match && match[1]) {
                newForm.formFields.push({
                    label,
                    type: "text",
                    value: "",
                    id: `field_${Date.now()}_${idSuffix}`,
                    answer: cleanText(match[1])
                });
            } else {
                console.warn(`Не удалось извлечь поле: ${label}`);
                // Добавляем пустое поле, если не найдено
                newForm.formFields.push({
                    label,
                    type: "text",
                    value: "",
                    id: `field_${Date.now()}_${idSuffix}`,
                    answer: ""
                });
            }
        };

        console.log("Normalized text:", normalizedText);
        Object.entries(regexPatterns).forEach(([name, pattern]) => {
            const match = normalizedText.match(pattern);
            console.log(`Match for ${name}:`, match ? match[1] : 'NOT FOUND');
        });
    
        // Порядок извлечения важен - от более специфичных к более общим
        extractField("Выводы", regexPatterns.conclusions, 12);
        extractField("Замечания и рекомендации", regexPatterns.remarks, 11);
        extractField("Результаты испытаний", regexPatterns.results, 10);
        extractField("Комплектность представляемого на тестовые испытания объекта", regexPatterns.equipment, 9);
        extractField("Метеоусловия при проведении испытаний", regexPatterns.weather, 8);
        extractField("Дата и время окончания проведения испытаний", regexPatterns.endDate, 7);
        extractField("Дата и время начала проведения испытаний", regexPatterns.startDate, 6);
        extractField("Место проведения испытаний", regexPatterns.place, 5);
        extractField("Цель испытаний", regexPatterns.purpose, 4);
        extractField("Основание проведения испытаний", regexPatterns.basis, 3);
        extractField("Заказчик", regexPatterns.customer, 2);
        extractField("Объект испытаний", regexPatterns.object, 1);
    
        // Переворачиваем порядок полей, так как добавляли с конца
        newForm.formFields.reverse();
    
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
                        multiple
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