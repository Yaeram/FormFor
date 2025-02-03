import React, { useState, useEffect } from 'react';
import db from '../../PouchDB/pouchdb';
import './Saved_Form.css';

function SavedForm() {
    const [savedForms, setSavedForms] = useState([]);

    useEffect(() => {
        const loadSavedForms = async () => {
            try {
                const result = await db.allDocs({ include_docs: true });
                if (result.rows && result.rows.length > 0) {
                    setSavedForms(result.rows.map(row => row.doc));
                } else {
                    setSavedForms([]);
                }
            } catch (error) {
                console.error('Error loading saved forms:', error);
                setSavedForms([]);
            }
        };

        loadSavedForms();
    }, []);

    return (
        <div className="saved-forms-container">
            <h2>Сохраненные анкеты</h2>
            {savedForms.length === 0 ? (
                <p>Нет сохраненных анкет.</p>
            ) : (
                <ul className="saved-forms-list">
                    {savedForms.map((form, index) => (
                        <li key={form._id} className="saved-form-item">
                            <div className="form-preview">
                            <h3>Анкета {index + 1}</h3>
                                {form.formFields.map((field, index) => (
                                    <div key={index} className="form-field-preview">
                                      <label>{field.label}:</label>
                                        {field.type === 'text' && <input type="text" readOnly />}
                                        {field.type === 'select' && (
                                            <select disabled>
                                                {field.options.map((option, index) => (
                                                    <option key={index}>{option}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SavedForm;