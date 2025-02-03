import React, { useState, useEffect } from 'react';
import AddTextField from '../../components/Form/AddTextField';
import AddSelectField from '../../components/Form/AddSelectField';
import FormPreview from './FormPreview';
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import {v4 as uuidv4} from "uuid";
import db from '../../PouchDB/pouchdb';
import './New_Form.css';

function New_Form() {
    const [formFields, setFormFields] = useState([]);

    useEffect(() => {
        // Загрузка данных из PouchDB при монтировании компонента
        const loadData = async () => {
            try{
                const result = await db.allDocs({include_docs: true})
                if(result.rows.length > 0){
                    setFormFields(result.rows[0].doc.formFields)
                }
            }
            catch(e) {
                console.error("Error loading from PouchDB", e)
            }
        }
        loadData();
    }, []);

    const addField = (newField) => {
      setFormFields([...formFields, {...newField, id: uuidv4()}]);
    };
  
      const deleteField = (id) => {
      const updatedFields = formFields.filter((field) => field.id !== id);
      setFormFields(updatedFields);
      };
      
      const saveForm = async () => {
        try {
                if(formFields.length > 0) {
                  const existing = await db.allDocs({include_docs: true});
                   if(existing.rows.length > 0) {
                       await db.put({
                          _id: existing.rows[0].id,
                          _rev: existing.rows[0].value.rev,
                           formFields: formFields
                       });
                   }
                   else {
                       await db.post({formFields: formFields});
                   }
               }
           alert('Анкета сохранена!');
        } catch (e) {
            console.error("Error saving to PouchDB", e);
        }
    };

    const clearData = async () => {
        try {
            const existing = await db.allDocs({include_docs: true});
            if(existing.rows.length > 0) {
                await db.remove(existing.rows[0].doc)
                setFormFields([])
            }
        } catch (e) {
            console.error("Error deleting from PouchDB", e)
        }
    }

  return (
    <div className="form-page">
           <Header></Header>
        <div className="form-page-container">
        <div> 
            <h1>Создание анкеты</h1>
        <AddTextField onAddField={addField} />
        <AddSelectField onAddField={addField} />
        </div>
        <div>
            <FormPreview formFields={formFields} onDeleteField={deleteField} /> {/* Превью формы */}
            <button onClick={saveForm}>Сохранить анкету</button>
            <button onClick={clearData}>Очистить анкету</button>
        </div> 
        </div>
        <Footer></Footer>
    </div>
  );
}

export default New_Form;