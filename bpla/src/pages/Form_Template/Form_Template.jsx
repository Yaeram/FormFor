import { useNavigate } from 'react-router-dom';
import db from '../../PouchDB/pouchdb';
import './Form_Template.css';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import Confirmation_Dialog from '../Form/cp_Form/Confirmation_Dialog/Confirmation_Dialog';
import React, { useState, useEffect } from 'react';

// function Form_Template() {
//     const [templates, setTemplates] = useState([]);
//     const navigate = useNavigate();
//     const [searchQuery, setSearchQuery] = useState('');
//     const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
//     const [templateToDelete, setTemplateToDelete] = useState(null);

//     const loadTemplates = async () => {
//         try {
//             const result = await db.allDocs({ include_docs: true, startkey: 'template_', endkey: 'template_\uffff' });
//             if (result.rows && result.rows.length > 0) {
//                 const templatesWithCreatedAt = result.rows.map(row => row.doc);
//                 setTemplates(templatesWithCreatedAt);
//             } else {
//                 setTemplates([]);
//             }
//         } catch (error) {
//             console.error('Error loading templates:', error);
//             setTemplates([]);
//         }
//     };

//     useEffect(() => {
//         loadTemplates();
//     }, []);

//     const handleTemplateSelect = (templateId) => {
//         navigate(`/form/${templateId}`);
//     };

//     const formatDate = (timestamp) => {
//         const date = new Date(timestamp);
//         return date.toLocaleString();
//     };

//     const handleDeleteTemplate = (templateId, templateRev) => {
//         setTemplateToDelete({ id: templateId, rev: templateRev });
//         setShowConfirmationDialog(true);
//     };

//     const handleConfirmation = async (confirmed) => {
//         setShowConfirmationDialog(false);
//         if (confirmed) {
//             try {
//                 await db.remove(templateToDelete.id, templateToDelete.rev);
//                 alert('Шаблон успешно удален!');
//                 loadTemplates(); // Обновляем список шаблонов после удаления
//             } catch (error) {
//                 console.error('Ошибка при удалении шаблона:', error);
//             }
//         }
//         setTemplateToDelete(null);
//     };

//     return (
//         <div className="form-template-container">
//             <Header></Header>
//             <div style={{marginLeft: 40, marginRight: 40, flex: 4}}>
//                 <h2>Шаблоны анкет</h2>
//                 <search>
//                     <input
//                         type="text"
//                         placeholder="Поиск по тегу или названию"
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                 </search>
//                 <div className="template-grid">
//                     {templates.map((template) => (
//                         <div key={template._id} className="template-box">
//                             <h3>{template.title}</h3>
//                             <p>Тег: {template.tag}</p>
//                             <p>Полей: {template.formFields ? template.formFields.length : 0}</p>
//                             <p>Создан: {formatDate(template.createdAt)}</p>
//                             <button onClick={() => handleTemplateSelect(template._id)}>Заполнить анкету</button>
//                             <button onClick={() => handleDeleteTemplate(template._id, template._rev)}>Удалить шаблон</button>
//                         </div>
//                     ))}
//                 </div>
//                 <Confirmation_Dialog
//                     isOpen={showConfirmationDialog}
//                     message="Вы уверены, что хотите удалить этот шаблон?"
//                     onConfirm={() => handleConfirmation(true)}
//                     onClose={() => setShowConfirmationDialog(false)}
//                 />
//             </div>
//             <Footer></Footer>
//         </div>
//     );
// }

// export default Form_Template;

function Form_Template() {
    const [templates, setTemplates] = useState([]);
    const navigate = useNavigate();
  
    // Функция для повторной загрузки шаблонов (теперь определена вне useEffect)
    const loadTemplates = async () => {
      try {
        const result = await db.allDocs({ include_docs: true, startkey: 'template_', endkey: 'template_\uffff' });
        if (result.rows && result.rows.length > 0) {
          const templatesWithCreatedAt = result.rows.map(row => row.doc);
          setTemplates(templatesWithCreatedAt);
        } else {
          setTemplates([]);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        setTemplates([]);
      }
    };
  
    useEffect(() => {
      loadTemplates(); // Вызываем loadTemplates при монтировании компонента
    }, []);
  
    const handleTemplateSelect = (templateId) => {
      navigate(`/form/${templateId}`);
    };
  
    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString();
    };
  
    const handleDeleteTemplate = async (templateId, templateRev) => {
      try {
        await db.remove(templateId, templateRev); // Удаляем шаблон по ID и _rev
        alert('Шаблон успешно удален!');
        // Обновляем список шаблонов после удаления
        await loadTemplates();
      } catch (error) {
        console.error('Ошибка при удалении шаблона:', error);
      }
    };
  
    return (
      <div className="form-template-container">
        <Header></Header>
        <div style={{flex: 4}}>
            <h2>Шаблоны анкет</h2>
            <div className="template-grid"> {/* Используем grid для "боксов" */}
            {templates.map(template => (
                <div key={template._id} className="template-box"> {/* "Бокс" для каждого шаблона */}
                <h3>{template.title}</h3>
                <p>Тег: {template.tag}</p>
                <p>Полей: {template.formFields ? template.formFields.length : 0}</p>
                <p>Создан: {formatDate(template.createdAt)}</p>
                <button onClick={() => handleTemplateSelect(template._id)}>Заполнить анкету</button>
                <button onClick={() => handleDeleteTemplate(template._id, template._rev)}>Удалить шаблон</button> {/* Кнопка "Удалить" */}
                </div>
            ))}
            </div>
        </div>
        <Footer></Footer>
      </div>
    );
  }
  
  export default Form_Template;