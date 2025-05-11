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
            const formTag = generateTag();
            const filledFormData = {
                _id: `form_${uuidv4()}`,
                templateId: templateId,
                formFields: formData,
                tableData: tableDataArray,
                type: 'form',
                title: formTitle,
                tag: formTag,
                createdAt: Date.now()
            };

            const filled_responce = await db.put(filledFormData);
            console.log(filledFormData)
            const dataWithRev = {
                ...filledFormData,
                _rev: filled_responce.rev
            }

            const response = await fetch('http://localhost:8000/forms/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataWithRev)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            onComplete(formTag, filledFormData);
        } catch (error) {
            console.error('Error saving filled form:', error);
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