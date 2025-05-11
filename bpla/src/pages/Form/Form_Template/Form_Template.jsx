import { useNavigate } from 'react-router-dom';
import db from '../../../PouchDB/pouchdb';
import './Form_Template.css';
import { Header } from '../../../components/Header/Header';
import { Footer } from '../../../components/Footer/Footer';
import Confirmation_Dialog from '../cp_Form/Confirmation_Dialog/Confirmation_Dialog';
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

function Form_Template() {
  const [templates, setTemplates] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  // Функция для генерации тега
  const generateTag = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let tag = '';
    for (let i = 0; i < 4; i++) {
      tag += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return tag;
  };

  // Функция для проверки и добавления шаблона по умолчанию
  const checkAndAddDefaultTemplate = async () => {
    try {
      // Проверяем, существует ли уже шаблон
      const result = await db.allDocs({ 
        include_docs: true, 
        startkey: 'template_', 
        endkey: 'template_\uffff' 
      });
      
      const defaultTemplateExists = result.rows.some(doc => 
        doc.doc?.title === "Протокол испытаний FPV БПЛА мультироторного типа"
      );

      if (!defaultTemplateExists) {
        const defaultTemplate = {
          _id: `template_${uuidv4()}`,
          title: "Протокол испытаний FPV БПЛА мультироторного типа",
          formFields: [
            { label: "Объект испытаний", type: "text", value: "", id: uuidv4(), answer: "" },
            { label: "Заказчик", type: "text", value: "", id: uuidv4(), answer: "" },
            { label: "Основание проведения испытаний", type: "text", value: "", id: uuidv4(), answer: "" },
            { label: "Цель испытаний", type: "text", value: "", id: uuidv4(), answer: "" },
            { label: "Место проведения испытаний", type: "text", value: "", id: uuidv4(), answer: "" },
            { label: "Дата и время начала проведения испытаний", type: "text", value: "", id: uuidv4(), answer: "" },
            { label: "Дата и время окончания проведения испытаний", type: "text", value: "", id: uuidv4(), answer: "" },
            { label: "Метеоусловия при проведении испытаний", type: "text", value: "", id: uuidv4(), answer: "" },
            { label: "Комплектность представляемого на тестовые испытания объекта", type: "text", value: "", id: uuidv4(), answer: "" },
            { label: "Замечания и рекомендации", type: "text", value: "", id: uuidv4(), answer: "" },
            { label: "Выводы", type: "text", value: "", id: uuidv4(), answer: "" }
          ],
          tableData: [
            { tableName: "Результаты испытаний", tableData: [
              ['№', 'Проверяемый показатель по всем пунктам прогрыммы испытаний', 'Фактическое значение', 'Значение по ТЗ', 'Примечание'],
              ['1.', 'Способность БВС маневрировать по горизонту и высоте во время полёта с полезной нагрузкой, массой предусмотренной в ТТХ, на минимальной скорости', '', '', ''],
              ['1.1.', 'на средней скорости', '', '', ''],
              ['1.2.', 'на максимальной скорости', '', '', ''],
              ['2.', 'Способность БВС выполнять сброс груза по сигналу с пульта управления в определенной точке маршрута', '', '', ''],  
              ['3.', 'Способность БАС обеспечивать выполнение полетов в условиях высокой влажности воздуха (моросящий дождь, туман, снег) (п.3.3.)', '', '', ''],
              ["4.", "Способность БВС выполнять полеты продолжительностью не менее 10 минут с нагрузкой, предусмотренной в ТТХ.", "", "", ""],
              ["5.", "Максимальное время полёта БВС с максимально возможной полезной нагрузкой", "", "", ""],
              ["6.", "Дальность видеосвязи от аппаратуры управления до БВС в условиях прямой видимости между ними", "", "", ""]]
            }
          ],
          type: "template",
          tag: generateTag(),
          createdAt: Date.now()
        };

        await db.put(defaultTemplate);
        console.log("Шаблон по умолчанию успешно добавлен");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Ошибка при проверке/добавлении шаблона по умолчанию:", error);
      return false;
    }
  };

  const loadTemplates = async () => {
    try {
      const wasAdded = await checkAndAddDefaultTemplate();
      
      const result = await db.allDocs({ 
        include_docs: true, 
        startkey: 'template_', 
        endkey: 'template_\uffff' 
      });
      
      if (result.rows && result.rows.length > 0) {
        const templatesWithCreatedAt = result.rows.map(row => row.doc);
        setTemplates(templatesWithCreatedAt);
      } else {
        setTemplates([]);
      }
      
      if (wasAdded) {
        setTimeout(() => {
          alert('Был добавлен шаблон по умолчанию "Протокол испытаний FPV БПЛА мультироторного типа"');
        }, 500);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleTemplateSelect = (templateId) => {
    navigate(`/form/${templateId}`);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleDeleteTemplate = (templateId, templateRev) => {
    setTemplateToDelete({ id: templateId, rev: templateRev });
    setShowConfirmationDialog(true);
  };

  const handleConfirmation = async (confirmed) => {
    setShowConfirmationDialog(false);
    if (confirmed) {
      try {
        await db.remove(templateToDelete.id, templateToDelete.rev);

        try {
          const response = await fetch(
            `http://localhost:8000/templates/${templateToDelete.id}`, {
            method: 'DELETE'
          });

          console.log("Успешно удалено с сервера.", response)
        } catch(error) {
          console.error("Ошибка при удалении с сервера.", error)
          alert('Шаблон удален локально, но возникла ошибка при удалении с сервера')
        }

        loadTemplates();
        console.log("Шаблон  успешно удален с сервера.")

      } catch (error) {
        console.error('Ошибка при удалении шаблона:', error);
      }
    }
  setTemplateToDelete(null);
};

  return (
    <div className="form-template-container">
      <Header></Header>
      <div className='form-template-content'>
        <h2>Шаблоны анкет</h2>
        <input
          type="text"
          placeholder="Поиск по тегу или названию"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="template-grid">
          {templates
            .filter(template =>
              template.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
              template.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((template) => (
              <div key={template._id} className="template-box">
                <h3>{template.title}</h3>
                <p>Тег: {template.tag}</p>
                <p>Полей: {template.formFields ? template.formFields.length : 0}</p>
                <p>Создан: {formatDate(template.createdAt)}</p>
                <button onClick={() => handleTemplateSelect(template._id)}>Заполнить анкету</button>
                <button onClick={() => handleDeleteTemplate(template._id, template._rev)}>Удалить шаблон</button>
              </div>
            ))}
        </div>
        <Confirmation_Dialog
          isOpen={showConfirmationDialog}
          message="Вы уверены, что хотите удалить этот шаблон?"
          onConfirm={() => handleConfirmation(true)}
          onClose={() => setShowConfirmationDialog(false)}
        />
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Form_Template;