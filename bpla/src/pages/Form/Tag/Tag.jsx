import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import db from '../../../PouchDB/pouchdb';

function Tag({ formTitle, formData, templateId, onComplete }) {
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
        try {
            const formTag = generateTag();
            const filledFormData = {
                _id: `form_${uuidv4()}`,
                templateId: templateId,
                formFields: formData, //  Сохраняем formData с ответами
                type: 'form',
                title: formTitle,
                tag: formTag,
                createdAt: Date.now()  //  Добавляем дату создания
            };
            await db.put(filledFormData);
            onComplete(formTag, filledFormData); // Notify parent with the generated tag and filled form data
        } catch (error) {
            console.error('Error saving filled form:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button onClick={handleSave} disabled={isGenerating}>
            {isGenerating ? 'Сохранение...' : 'Сохранить заполненную анкету'}
        </button>
    );
}

export default Tag;