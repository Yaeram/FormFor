import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './Tag.css'
import db from '../../../../PouchDB/pouchdb';

function Tag({ defaultTitle, formTitle, formData, templateId, onComplete, tableDataArray }) {
    const [isGenerating, setIsGenerating] = useState(false);

    // Функция для генерации случайного тега
    const generateTag = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let tag = '';
        for (let i = 0; i < 4; i++) {
            tag += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return tag;
    };

   const handleSave = async () => {
    setIsGenerating(true);
    formTitle = formTitle || defaultTitle;
    
    try {
        const isConnected = localStorage.getItem('connected') === 'true';
        const isAuthorized = localStorage.getItem('authorized') === 'true';
        const username = localStorage.getItem('username'); 

        const formTag = generateTag();
        const filledFormData = {
            _id: `form_${uuidv4()}`,
            templateId: templateId,
            formFields: formData,
            tableData: tableDataArray,
            type: 'form',
            title: formTitle,
            tag: formTag,
            createdAt: Date.now(),
            username: username
        };

        const filled_response = await db.put(filledFormData);
        const dataWithRev = {
            ...filledFormData,
            _rev: filled_response.rev
        };

        if (isConnected && isAuthorized) {
            try {
                const response = await fetch('http://localhost:8000/forms/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...dataWithRev,
                        template_id: dataWithRev.templateId,
                        form_fields: dataWithRev.formFields,
                        table_data: dataWithRev.tableData,
                        created_at: dataWithRev.createdAt
                    })
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сервера: ${response.statusText}`);
                }

                console.log('Анкета успешно сохранена на сервере');
            } catch (serverError) {
                console.error('Ошибка при сохранении на сервере:', serverError);
            }
        }

        onComplete(formTag, filledFormData);

        alert(isConnected && isAuthorized 
            ? 'Анкета успешно сохранена и отправлена!' 
            : 'Анкета сохранена локально');

    } catch (error) {
        console.error('Ошибка при сохранении анкеты:', error);
        alert('Ошибка при сохранении анкеты');
    } finally {
        setIsGenerating(false);
    }
};


    return (
        <button onClick={handleSave} disabled={isGenerating} className='save-template-button'>
            {isGenerating ? 'Сохранение...' : 'Сохранить заполненную анкету'}
        </button>
    );
}

export default Tag;