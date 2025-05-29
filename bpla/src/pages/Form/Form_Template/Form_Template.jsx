import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import db from '../../../PouchDB/pouchdb';
import { Header } from '../../../components/Header/Header';
import { Footer } from '../../../components/Footer/Footer';
import Confirmation_Dialog from '../cp_Form/Confirmation_Dialog/Confirmation_Dialog';

import './Form_Template.css';

function Form_Template() {
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const navigate = useNavigate();

  const generateTag = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  const checkAndAddDefaultTemplate = async () => {
    try {
      const result = await db.allDocs({
        include_docs: true,
        startkey: 'template_',
        endkey: 'template_\uffff'
      });

      const defaultExists = result.rows.some(
        doc => doc.doc?.title === 'Протокол испытаний FPV БПЛА мультироторного типа'
      );

      if (!defaultExists) {
        const defaultTemplate = {
          _id: `template_${uuidv4()}`,
          title: 'Протокол испытаний FPV БПЛА мультироторного типа',
          formFields: [
            'Объект испытаний', 'Заказчик', 'Основание проведения испытаний',
            'Цель испытаний', 'Место проведения испытаний',
            'Дата и время начала проведения испытаний',
            'Дата и время окончания проведения испытаний',
            'Метеоусловия при проведении испытаний',
            'Комплектность представляемого на тестовые испытания объекта',
            'Замечания и рекомендации', 'Выводы'
          ].map(label => ({
            label, type: 'text', value: '', id: uuidv4(), answer: ''
          })),
          tableData: [{
            tableName: 'Результаты испытаний',
            tableData: [
              ['№', 'Проверяемый показатель по всем пунктам прогрыммы испытаний', 'Фактическое значение', 'Значение по ТЗ', 'Примечание'],
              ['1.', 'Маневрирование с полезной нагрузкой на минимальной скорости', '', '', ''],
              ['1.1.', 'на средней скорости', '', '', ''],
              ['1.2.', 'на максимальной скорости', '', '', ''],
              ['2.', 'Сброс груза по сигналу', '', '', ''],
              ['3.', 'Полет в условиях высокой влажности', '', '', ''],
              ['4.', 'Полет не менее 10 минут с нагрузкой', '', '', ''],
              ['5.', 'Максимальное время полета с нагрузкой', '', '', ''],
              ['6.', 'Дальность видеосвязи при прямой видимости', '', '', '']
            ]
          }],
          type: 'template',
          tag: generateTag(),
          createdAt: Date.now()
        };

        await db.put(defaultTemplate);
        console.log('Шаблон по умолчанию успешно добавлен');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Ошибка при добавлении шаблона по умолчанию:', err);
      return false;
    }
  };

  const syncLocalTemplatesToServer = async () => {
    try {
      const isConnected = localStorage.getItem('connected') === 'true';
      const isAuthorized = localStorage.getItem('authorized') === 'true';

      if (!isConnected || !isAuthorized) {
        console.log('Нет подключения или авторизации для синхронизации');
        return;
      }

      const localResult = await db.allDocs({
        include_docs: true,
        startkey: 'template_',
        endkey: 'template_\uffff'
      });

      if (!localResult.rows.length) return;

      const [idsRes, templatesRes] = await Promise.all([
        fetch('http://localhost:8000/templates/ids'),
        fetch('http://localhost:8000/templates/')
      ]);

      const serverIds = await idsRes.json();
      const serverTemplates = await templatesRes.json();

      const newTemplates = [];
      const updatedTemplates = [];

      localResult.rows.forEach(row => {
        const local = row.doc;
        const remote = serverTemplates.find(t => t.id === local._id);

        const mappedTemplate = {
          _id: local._id,
          title: local.title,
          formFields: local.formFields,
          tableData: local.tableData,
          type: local.type,
          tag: local.tag,
          createdAt: local.createdAt,
          _rev: local._rev,
          username: localStorage.getItem('username')
        };

        if (!remote) {
          newTemplates.push(mappedTemplate);
        } else if (
          new Date(local.updatedAt || local.createdAt) >
          new Date(remote.updated_at || remote.created_at)
        ) {
          updatedTemplates.push(mappedTemplate);
        }
      });

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      await Promise.allSettled([
        ...newTemplates.map(t => fetch('http://localhost:8000/templates/', {
          method: 'POST', headers, body: JSON.stringify(t)
        })),
        ...updatedTemplates.map(t => fetch(`http://localhost:8000/templates/${t._id}`, {
          method: 'PUT', headers, body: JSON.stringify(t)
        }))
      ]);

      const count = newTemplates.length + updatedTemplates.length;
      if (count > 0) {
        console.log(`Синхронизировано: новых - ${newTemplates.length}, обновленных - ${updatedTemplates.length}`);
      } else {
        console.log('Нет изменений для синхронизации');
      }

    } catch (err) {
      console.error('Ошибка синхронизации:', err);
    }
  };

  const loadTemplates = async () => {
    try {
      const wasAdded = await checkAndAddDefaultTemplate();

      const isConnected = localStorage.getItem('connected') === 'true';
      const isAuthorized = localStorage.getItem('authorized') === 'true';

      let loaded = [];

      if (isConnected && isAuthorized) {
        try {
          const res = await fetch('http://localhost:8000/templates/');
          if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
          const serverTemplates = await res.json();

          loaded = serverTemplates.map(t => ({
            _id: t.id,
            _rev: t.rev,
            title: t.title,
            formFields: t.form_fields,
            tableData: t.table_data,
            type: t.type,
            tag: t.tag,
            createdAt: new Date(t.created_at).getTime(),
            username: t.username
          }));
        } catch (err) {
          console.error('Ошибка API, переключаюсь на локальные шаблоны:', err);
          const local = await db.allDocs({
            include_docs: true,
            startkey: 'template_',
            endkey: 'template_\uffff'
          });
          loaded = local.rows.map(r => r.doc);
        }
      } else {
        const local = await db.allDocs({
          include_docs: true,
          startkey: 'template_',
          endkey: 'template_\uffff'
        });
        loaded = local.rows.map(r => r.doc);
      }

      setTemplates(loaded);

      if (wasAdded) {
        setTimeout(() => {
          alert('Добавлен шаблон по умолчанию "Протокол испытаний FPV БПЛА мультироторного типа"');
        }, 500);
      }

    } catch (err) {
      console.error('Ошибка загрузки шаблонов:', err);
      setTemplates([]);
    }
  };

  useEffect(() => {
    syncLocalTemplatesToServer();
    loadTemplates();
  }, []);

  const handleTemplateSelect = id => navigate(`/form/${id}`);

  const formatDate = timestamp => new Date(timestamp).toLocaleString();

  const handleDeleteTemplate = (id, rev) => {
    setTemplateToDelete({ id, rev });
    setShowConfirmationDialog(true);
  };

  const handleConfirmation = async confirmed => {
    setShowConfirmationDialog(false);
    if (!confirmed) return;

    const { id, rev } = templateToDelete;

    const isConnected = localStorage.getItem('connected') === 'true';
    const isAuthorized = localStorage.getItem('authorized') === 'true';

    if (!isConnected || !isAuthorized) {
      alert('Удаление невозможно: нет подключения или авторизации');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/templates/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);

      await db.remove(id, rev);
      console.log('Удалено локально и на сервере');

      loadTemplates();
      alert('Шаблон успешно удален');
    } catch (err) {
      console.error('Ошибка удаления шаблона:', err);
      alert(err.message || 'Ошибка при удалении шаблона');
    } finally {
      setTemplateToDelete(null);
    }
  };

  return (
    <div className="form-template-container">
      <Header />

      <div className="form-template-content">
        <h2>Шаблоны анкет</h2>

        <input
          type="text"
          placeholder="Поиск по тегу или названию"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <div className="template-grid">
          {templates
            .filter(t =>
              t.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(t => (
              <div key={t._id} className="template-box">
                <h3>{t.title}</h3>
                <p>Тег: {t.tag}</p>
                <p>Полей: {t.formFields?.length ?? 0}</p>
                <p>Создан: {formatDate(t.createdAt)}</p>
                <button onClick={() => handleTemplateSelect(t._id)}>Заполнить анкету</button>
                <button onClick={() => handleDeleteTemplate(t._id, t._rev)}>Удалить шаблон</button>
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

      <Footer />
    </div>
  );
}

export default Form_Template;
