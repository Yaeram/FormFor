import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddSelectField from './cp_NForm/Form/AddSelectField';
import AddTextField from './cp_NForm/Form/AddTextField';
import FormPreview from './cp_NForm/Preview/FormPreview';
import Table_Form from './cp_NForm/Table_Form/Table_Form';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import './New_Form.css';
import { v4 as uuidv4 } from 'uuid';
import db from '../../PouchDB/pouchdb';

function New_Form() {
    const [formFields, setFormFields] = useState([]);
    const [tableDataArray, setTableDataArray] = useState([]);
    const [rowCount, setRowCount] = useState(2);
    const [colCount, setColCount] = useState(2);
    const navigate = useNavigate();
    const [templateTitle, setTemplateTitle] = useState('');

    const generateTag = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let tag = '';
        for (let i = 0; i < 4; i++) {
            tag += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return tag;
    };

    const handleAddTable = () => {
        const newTableData = Array(rowCount).fill(null).map(() => Array(colCount).fill(' '));
        setTableDataArray([...tableDataArray, newTableData]);
    };

    const handleTableChange = (index, newTableData) => {
        const updatedTableDataArray = [...tableDataArray];
        updatedTableDataArray[index] = newTableData;
        setTableDataArray(updatedTableDataArray);
    };

    const handleDeleteTable = (index) => {
        console.log("Удаляем таблицу с индексом:", index);
        const updatedTableDataArray = [...tableDataArray];
        updatedTableDataArray.splice(index, 1);
        setTableDataArray(updatedTableDataArray);
    };

    const addField = (newField) => {
        setFormFields([...formFields, { ...newField, id: uuidv4() }]);
    };

    const handleDeleteField = (id) => {
        setFormFields(formFields.filter(field => field.id !== id));
    };

    const saveTemplate = async () => {
        try {
            const templateTag = generateTag();
            const templateData = {
                _id: `template_${uuidv4()}`,
                title: templateTitle,
                formFields: formFields || [],
                tableData: tableDataArray,
                type: 'template',
                tag: templateTag,
                createdAt: Date.now()
            };
            await db.put(templateData);
            alert(`Шаблон анкеты "${templateTitle}" сохранен с тегом: ${templateTag}!`);
            navigate('/Form_Template');
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    return (
        <div className="new-form-container">
            <Header></Header>
            <div style={{flex: 4, marginBottom: 20}}>
                <h2>Создать новый шаблон анкеты</h2>
                <div className="new-form-content">
                    <div className="new-form-creation">
                        <label>
                            Название шаблона:
                            <input
                                type="text"
                                value={templateTitle}
                                onChange={(e) => setTemplateTitle(e.target.value)}
                            />
                        </label>
                        <AddTextField onAddField={addField} />
                        <AddSelectField onAddField={addField} />

                        <label>
                            Количество строк:
                            <input
                                type="number"
                                value={rowCount}
                                onChange={(e) => setRowCount(parseInt(e.target.value) || 2)}
                            />
                        </label>
                        <label>
                            Количество столбцов:
                            <input
                                type="number"
                                value={colCount}
                                onChange={(e) => setColCount(parseInt(e.target.value) || 2)}
                            />
                        </label>
                        <button onClick={handleAddTable}>Добавить таблицу</button>

                        {tableDataArray.map((tableData, index) => (
                            <Table_Form
                                key={index}
                                tableData={tableData}
                                onTableChange={(newTableData) => handleTableChange(index, newTableData)}
                                onDeleteTable={handleDeleteTable} // Передаем handleDeleteTable
                                index={index} // Передаем индекс
                            />
                        ))}

                        {/* FormPreview здесь */}
                        <FormPreview
                            formFields={formFields}
                            tableDataArray={tableDataArray}
                            onDeleteField={handleDeleteField}
                            onDeleteTable={handleDeleteTable}
                        />
                    </div>
                </div>

                <button onClick={saveTemplate}>Сохранить шаблон</button>
            </div>
            <Footer></Footer>
        </div>
    );
}

export default New_Form;