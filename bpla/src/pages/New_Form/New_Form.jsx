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
    const [isTableCreationVisible, setIsTableCreationVisible] = useState(false);
    const [tableName, setTableName] = useState('');
    const [newTableRows, setNewTableRows] = useState(3);
    const [newTableCols, setNewTableCols] = useState(3);
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

    const createEmptyTableData = (rows, cols) => {
        return Array(rows).fill(null).map(() => Array(cols).fill(''));
    };

    const handleAddTable = () => {
        const newTableData = {
            tableName: tableName,
            tableData: createEmptyTableData(newTableRows, newTableCols)
        };
        setTableDataArray([...tableDataArray, newTableData]);
        setIsTableCreationVisible(false);
        setTableName('');
    };

    const handleTableChange = (index, newTableData) => {
        const newTableDataArray = [...tableDataArray];
        newTableDataArray[index].tableData = newTableData;
        setTableDataArray(newTableDataArray);
    };

    const handleDeleteTable = (index) => {
        const newTableDataArray = [...tableDataArray];
        newTableDataArray.splice(index, 1);
        setTableDataArray(newTableDataArray);
    };

    const addField = (newField) => {
        if (newField.type === 'select' && (newField.selectType === 'image' || newField.selectType === 'video')) {
            const newFields = newField.options.map(option => ({
                id: uuidv4(),
                label: newField.label,
                type: newField.selectType,
                value: null,
                relatedOption: option,
            }));
            setFormFields([...formFields, ...newFields]);
        } else {
            let initialValue = '';
            if (newField.type === 'image' || newField.type === 'video') {
                initialValue = null;
            }
            setFormFields([...formFields, { ...newField, id: uuidv4(), value: initialValue }]);
        }
    };

    const handleFileChange = (fieldId, file) => {
        if (!file) {
            setFormFields(prevFields =>
                prevFields.map(field =>
                    field.id === fieldId ? { ...field, value: null } : field
                )
            );
            return;
        }
        const reader = new FileReader();

        reader.onload = (e) => {
            setFormFields(prevFields =>
                prevFields.map(field =>
                    field.id === fieldId ? { ...field, value: e.target.result } : field
                )
            );
        };

        reader.readAsDataURL(file);
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

            console.log("Saving template data:", templateData); // Add this line

            await db.put(templateData);
            alert(`Шаблон анкеты "${templateTitle}" сохранен с тегом: ${templateTag}!`);
            navigate('/Form_Template');
        } catch (error) {
            console.error('Error saving template:', error);
            alert(`Ошибка при сохранении шаблона: ${error.message}`); // Improved error message
        }
    };

    const handleShowTableCreation = () => {
        setIsTableCreationVisible(true);
    };

    const handleTableNameChange = (e) => {
        setTableName(e.target.value);
    };

    const handleNewTableRowsChange = (e) => {
        setNewTableRows(parseInt(e.target.value, 10) || 2); // Changed default to 2
    };

    const handleNewTableColsChange = (e) => {
        setNewTableCols(parseInt(e.target.value, 10) || 2); // Changed default to 2
    };

    return (
        <div className="new-form-container">
            <Header />
            <div style={{ flex: 4, marginBottom: 20 }}>
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

                        <button onClick={handleShowTableCreation}>Создать таблицу</button>

                        {isTableCreationVisible && (
                            <div className="table-creation-settings">
                                <label>
                                    Название таблицы:
                                    <input
                                        type="text"
                                        value={tableName}
                                        onChange={handleTableNameChange}
                                    />
                                </label>
                                <label>
                                    Количество строк:
                                    <input
                                        type="number"
                                        value={newTableRows}
                                        onChange={(e) => setNewTableRows(parseInt(e.target.value, 10) || 2)}
                                    />
                                </label>
                                <label>
                                    Количество столбцов:
                                    <input
                                        type="number"
                                        value={newTableCols}
                                        onChange={(e) => setNewTableCols(parseInt(e.target.value, 10) || 2)}
                                    />
                                </label>
                                <button onClick={handleAddTable}>Добавить таблицу</button>
                            </div>
                        )}

                        {/* FormPreview здесь */}
                        <FormPreview
                            formFields={formFields}
                            tableDataArray={tableDataArray}
                            onDeleteField={handleDeleteField}
                            onDeleteTable={handleDeleteTable}
                            handleFileChange={handleFileChange}
                            onTableChange={handleTableChange}  //  <----  ОЧЕНЬ ВАЖНО
                        />
                    </div>
                </div>
                <button onClick={saveTemplate}>Сохранить шаблон</button>
            </div>
            <Footer />
        </div>
    );
}

export default New_Form;

