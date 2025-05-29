import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [searchQuery, setSearchQuery] = useState('');

  // Загрузка форм при монтировании компонента
  useEffect(() => {
    const loadSavedForms = async () => {
      try {
        const isConnected = localStorage.getItem('connected') === 'true';
        const isAuthorized = localStorage.getItem('authorized') === 'true';
        const username = localStorage.getItem('username');

        if (isConnected && isAuthorized && username) {
          try {
            const response = await fetch(`http://localhost:8000/forms/by_user/${username}`);
            if (!response.ok) throw new Error('Server response not OK');
            const serverForms = await response.json();

            const transformedForms = serverForms.map(form => ({
              _id: form._id,
              templateId: form.templateId,
              title: form.title,
              type: form.type,
              tag: form.tag,
              createdAt: new Date(form.createdAt).getTime(),
              updatedAt: form.updatedAt ? new Date(form.updatedAt).getTime() : null,
              formFields: form.formFields,
              tableData: form.tableData,
              _rev: form._rev,
              username: form.username,
            }));

            setSavedForms(transformedForms.sort((a, b) => b.createdAt - a.createdAt));
            return;
          } catch (serverError) {
            console.error('Ошибка загрузки с сервера:', serverError);
          }
        }

        // Если нет соединения или авторизации, загружаем локально
        const localForms = await db.allDocs({
          include_docs: true,
          startkey: 'form_',
          endkey: 'form_\uffff',
        });

        const sortedForms = localForms.rows
          .map(row => row.doc)
          .sort((a, b) => b.createdAt - a.createdAt);

        setSavedForms(sortedForms);
      } catch (error) {
        console.error('Ошибка загрузки сохранённых форм:', error);
      }
    };

    loadSavedForms();
  }, []);

  // Синхронизация форм с сервером
  useEffect(() => {
    const syncFormsWithServer = async () => {
      try {
        const isConnected = localStorage.getItem('connected') === 'true';
        const isAuthorized = localStorage.getItem('authorized') === 'true';
        const username = localStorage.getItem('username');

        if (!isConnected || !isAuthorized || !username) {
          console.log('Синхронизация невозможна: нет соединения или авторизации');
          return;
        }

        const localFormsResponse = await db.allDocs({
          include_docs: true,
          startkey: 'form_',
          endkey: 'form_\uffff',
        });
        const localForms = localFormsResponse.rows.map(row => row.doc);
        if (localForms.length === 0) return;

        const serverIdsResponse = await fetch(`http://localhost:8000/forms/ids?username=${username}`);
        const serverFormIds = await serverIdsResponse.json();

        const formsToCreate = [];
        const formsToUpdate = [];

        for (const localForm of localForms) {
          const existsOnServer = serverFormIds.includes(localForm._id);

          if (!existsOnServer) {
            formsToCreate.push(localForm);
          } else {
            // Получаем форму с сервера для сравнения дат обновления
            const serverFormResponse = await fetch(`http://localhost:8000/forms/${localForm._id}`);
            const serverForm = await serverFormResponse.json();

            const serverUpdatedAt = serverForm.updatedAt
              ? new Date(serverForm.updatedAt).getTime()
              : serverForm.createdAt
              ? new Date(serverForm.createdAt).getTime()
              : 0;
            const localUpdatedAt = localForm.updatedAt
              ? new Date(localForm.updatedAt).getTime()
              : localForm.createdAt
              ? new Date(localForm.createdAt).getTime()
              : 0;

            if (localUpdatedAt > serverUpdatedAt) {
              formsToUpdate.push(localForm);
            }
          }
        }

        const createPromises = formsToCreate.map(form =>
          fetch('http://localhost:8000/forms/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          })
        );

        const updatePromises = formsToUpdate.map(form =>
          fetch(`http://localhost:8000/forms/${form._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          })
        );

        const allResults = await Promise.allSettled([...createPromises, ...updatePromises]);
        const failedSyncs = allResults.filter(r => r.status === 'rejected');

        if (failedSyncs.length > 0) {
          console.error('Не удалось синхронизировать некоторые формы:', failedSyncs);
          throw new Error(`Ошибка синхронизации ${failedSyncs.length} форм`);
        }

        console.log(`Успешно синхронизировано: ${formsToCreate.length} новых, ${formsToUpdate.length} обновленных форм`);
      } catch (error) {
        console.error('Ошибка синхронизации форм:', error);
      }
    };

    syncFormsWithServer();
  }, []);

  // Генерация случайного тега из 4 символов
  const generateTag = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let tag = '';
    for (let i = 0; i < 4; i++) {
      tag += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return tag;
  };

  // Удаление формы
    const handleDeleteForm = (formId) => {
        setFormToDelete(formId);
        setShowConfirmationDialog(true);
    };

    const handleConfirmation = async confirmed => {
        setShowConfirmationDialog(false);
        if (!confirmed) return;

        const isConnected = localStorage.getItem('connected') === 'true';
        const isAuthorized = localStorage.getItem('authorized') === 'true';

        if (!isConnected || !isAuthorized) {
            alert('Удаление невозможно: нет подключения или авторизации');
            return;
        }

        try {
            const res = await fetch(`http://localhost:8000/forms/${formToDelete}`, {
            method: 'DELETE',
            });

            if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);

            const doc = await db.get(formToDelete);
            await db.remove(doc);
            console.log('Форма удалена локально и на сервере');

            setSavedForms(prev => prev.filter(form => form._id !== formToDelete));
            alert('Форма успешно удалена');
        } catch (err) {
            console.error('Ошибка удаления формы:', err);
            alert(err.message || 'Ошибка при удалении формы');
        } finally {
            setFormToDelete(null);
        }
    };


  // Загрузка Word документов и их парсинг
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
              console.error('Ошибка обработки документа Word:', error);
              reject(error);
            }
          };
          reader.onabort = () => reject(new Error('Чтение файла было прервано'));
          reader.onerror = () => reject(new Error('Ошибка чтения файла'));
          reader.readAsArrayBuffer(file);
        });
      });

      await Promise.all(uploadPromises);

      const forms = await db.allDocs({
        include_docs: true,
        startkey: 'form_',
        endkey: 'form_\uffff',
      });
      const sortedForms = forms.rows.map(row => row.doc).sort((a, b) => b.createdAt - a.createdAt);
      setSavedForms(sortedForms);

      alert(`Успешно загружено ${files.length} документов. Формы созданы.`);
    } catch (error) {
      console.error('Ошибка при обработке документов:', error);
      alert('Ошибка при обработке документов. Некоторые файлы могли не загрузиться.');
    } finally {
      event.target.value = '';
    }
  };

  // Парсинг таблицы результатов из текста документа
  const extractResultsTable = (text) => {
    const tableStart = text.indexOf('Результаты испытаний:');
    if (tableStart === -1) return [];

    const tableEnd = text.indexOf('Замечания и рекомендации', tableStart);
    if (tableEnd === -1) return [];

    const tableContent = text.slice(tableStart, tableEnd);

    const rows = [];
    rows.push([
      '№',
      'Проверяемый показатель по пунктам программы испытаний',
      'Фактическое значение',
      'Значение по ТЗ',
      'Примечание',
    ]);

    const lines = tableContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('+-'));

    const newlines = lines.slice(6, -1);

    let currentRow = [];

    for (const item of newlines) {
      if (/^\d+\./.test(item)) {
        if (currentRow.length > 0) {
          while (currentRow.length < 5) currentRow.push('');
          rows.push(currentRow);
        }
        currentRow = [item];
      } else {
        if (currentRow.length < 5) currentRow.push(item);
      }
    }
    if (currentRow.length > 0) {
      while (currentRow.length < 5) currentRow.push('');
      rows.push(currentRow);
    }

    return rows;
  };

  // Парсинг документа Word и формирование объекта формы
  const parseWordDocument = (text, filename) => {
    const normalizedText = text.replace(/\n+/g, '\n').replace(/\r/g, '').trim();

    const cleanText = text
      .replace(/\r/g, '')
      .replace(/\n+/g, '\n')
      .replace(/\.mark\}/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    const newForm = {
      _id: `form_${uuidv4()}`,
      templateId: undefined,
      type: 'form',
      title: filename,
      tag: generateTag(),
      createdAt: Date.now(),
      _rev: undefined,
      formFields: [],
      tableData: [],
    };

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
      remarks: /Замечания и рекомендации\s*\n([\s\S]+?)(?=\n\s*Выводы|$)/i,
      conclusions: /Выводы:\s*([\s\S]+)/i,
    };

    const extractField = (label, pattern, idSuffix) => {
      const match = normalizedText.match(pattern);
      newForm.formFields.push({
        label,
        type: 'text',
        value: '',
        id: `field_${Date.now()}_${idSuffix}`,
        answer: match && match[1] ? match[1].trim() : '',
      });
    };

    extractField('Выводы', regexPatterns.conclusions, 12);
    extractField('Замечания и рекомендации', regexPatterns.remarks, 11);
    extractField('Комплектность представляемого на тестовые испытания объекта', regexPatterns.equipment, 9);
    extractField('Метеоусловия при проведении испытаний', regexPatterns.weather, 8);
    extractField('Дата и время окончания проведения испытаний', regexPatterns.endDate, 7);
    extractField('Дата и время начала проведения испытаний', regexPatterns.startDate, 6);
    extractField('Место проведения испытаний', regexPatterns.place, 5);
    extractField('Цель испытаний', regexPatterns.purpose, 4);
    extractField('Основание проведения испытаний', regexPatterns.basis, 3);
    extractField('Заказчик', regexPatterns.customer, 2);
    extractField('Объект испытаний', regexPatterns.object, 1);

    newForm.formFields.reverse();

    const tableRows = extractResultsTable(cleanText);
    if (tableRows.length > 0) {
      newForm.tableData.push({
        tableName: 'Результаты испытаний',
        tableData: tableRows,
      });
    }

    return newForm;
  };

  return (
    <div className="saved-forms-container">
      <Header />
      <div className="saved-form-content">
        <h1>Сохранённые анкеты</h1>

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
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <div className="forms-list">
          {savedForms
            .filter(
              form =>
                form.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
                form.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(form => (
              <div key={form._id} className="form-card">
                {console.log(form)}
                <h2>{form.title}</h2>
                <p>Тег: {form.tag}</p>
                <p>Дата создания: {new Date(form.createdAt).toLocaleString()}</p>
                <div className="form-actions">
                    <Link
                        to={{
                            pathname: `/view/${form._id}`,
                        }}
                        state={{ formData: form }}
                        className="view-button"
                        >
                        Посмотреть
                    </Link>
                  <button onClick={() => handleDeleteForm(form._id)} className="delete-button">
                    Удалить
                  </button>
                </div>
              </div>
            ))}
        </div>

        {showConfirmationDialog && (
          <Confirmation_Dialog
            message="Вы уверены, что хотите удалить эту форму?"
            onConfirm={handleConfirmation}
            onCancel={() => setShowConfirmationDialog(false)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Saved_Form;
