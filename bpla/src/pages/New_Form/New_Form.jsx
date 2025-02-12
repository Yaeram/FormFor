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
            <div style={{flex: 4}}>
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
                            />
                        ))}
                    </div>

                    <div className="form-preview-container">
                        <h3>Предварительный просмотр:</h3>
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

// function New_Form() {
//     const [formFields, setFormFields] = useState([]);
//     const [tableData, setTableData] = useState([['', ''], ['', '']]); //  Состояние для данных таблицы
//     const [rowCount, setRowCount] = useState(2);
//     const [colCount, setColCount] = useState(2);
//     const navigate = useNavigate();
//     const [templateTitle, setTemplateTitle] = useState(''); // Добавляем состояние для названия шаблона

//     // Функция для генерации случайного тега
//     const generateTag = () => {
//         const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//         let tag = '';
//         for (let i = 0; i < 4; i++) {
//             tag += characters.charAt(Math.floor(Math.random() * characters.length));
//         }
//         return tag;
//     };

//     const handleTableChange = (newTableData) => {
//         setTableData(newTableData);
//         console.log('Table data in New_Form:', newTableData);
//     };

//     const addField = (newField) => {
//         setFormFields([...formFields, { ...newField, id: uuidv4() }]);
//     };
//     const saveTemplate = async () => {
//         try {
//             const templateTag = generateTag(); // Генерируем тег
//             const templateData = {
//                 _id: `template_${uuidv4()}`,
//                 title: templateTitle, // Сохраняем название шаблона
//                 formFields: formFields || [],
//                 tableData: tableData, // Сохраняем данные таблицы
//                 type: 'template',
//                 tag: templateTag, // Сохраняем тег
//                 createdAt: Date.now() // Добавляем дату и время создания
//             };

//             console.groupCollapsed('Saving Template'); // Group console logs
//             console.log('Template data before saving:', templateData);
//             console.log('Template ID:', templateData._id);
//             console.log('Template Type:', templateData.type);
//             console.log('Template Form Fields:', templateData.formFields);
//             console.log('Template Tag:', templateData.tag);
//             console.groupEnd();

//             await db.put(templateData);

//             console.log('Template saved successfully with ID:', templateData._id);
//             alert(`Шаблон анкеты "${templateTitle}" сохранен с тегом: ${templateTag}!`);
//             navigate('/Form_Template'); // Перенаправляем на FormTemplate
//         } catch (error) {
//             console.error('Error saving template:', error);
//         }
//     };

//     return (
//         <div className="new-form-container">
//             <Header></Header>
//             <div style={{flex: 4}}>
//                 <h2>Создать новый шаблон анкеты</h2>
//                 <div className="new-form-content">
//                     <div className="new-form-creation">
//                         <label>
//                             Название шаблона:
//                             <input
//                                 type="text"
//                                 value={templateTitle}
//                                 onChange={(e) => setTemplateTitle(e.target.value)}
//                             />
//                         </label>
//                         <AddTextField onAddField={addField} />
//                         <AddSelectField onAddField={addField} />

//                         {/* Добавляем элементы управления для таблицы */}
//                         <label>
//                             Количество строк:
//                             <input
//                                 type="number"
//                                 value={rowCount}
//                                 onChange={(e) => setRowCount(parseInt(e.target.value) || 2)}
//                             />
//                         </label>
//                         <label>
//                             Количество столбцов:
//                             <input
//                                 type="number"
//                                 value={colCount}
//                                 onChange={(e) => setColCount(parseInt(e.target.value) || 2)}
//                             />
//                         </label>
//                         <Table_Form rowCount={rowCount} colCount={colCount} onTableChange={handleTableChange} />
//                     </div>

//                     <div className="form-preview-container">
//                         <h3>Предварительный просмотр:</h3>
//                         <FormPreview formFields={formFields} tableData={tableData} /> {/* Передаем tableData */}
//                     </div>
//                 </div>

//                 <button onClick={saveTemplate}>Сохранить шаблон</button>
//             </div>
//             <Footer></Footer>
//         </div>
//     );
// }

// export default New_Form;

// function New_Form() {
//     const [formFields, setFormFields] = useState([]);
//     const navigate = useNavigate();
//     const [templateTitle, setTemplateTitle] = useState(''); // Добавляем состояние для названия шаблона

//     // Функция для генерации случайного тега
//     const generateTag = () => {
//         const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//         let tag = '';
//         for (let i = 0; i < 4; i++) {
//             tag += characters.charAt(Math.floor(Math.random() * characters.length));
//         }
//         return tag;
//     };

//     const addField = (newField) => {
//         setFormFields([...formFields, { ...newField, id: uuidv4() }]);
//     };
//     const saveTemplate = async () => {
//         try {
//             const templateTag = generateTag(); // Генерируем тег
//             const templateData = {
//                 _id: `template_${uuidv4()}`,
//                 title: templateTitle, // Сохраняем название шаблона
//                 formFields: formFields || [],
//                 type: 'template',
//                 tag: templateTag, // Сохраняем тег
//                 createdAt: Date.now() // Добавляем дату и время создания
//             };

//             console.groupCollapsed('Saving Template'); // Group console logs
//             console.log('Template data before saving:', templateData);
//             console.log('Template ID:', templateData._id);
//             console.log('Template Type:', templateData.type);
//             console.log('Template Form Fields:', templateData.formFields);
//             console.log('Template Tag:', templateData.tag);
//             console.groupEnd();

//             await db.put(templateData);

//             console.log('Template saved successfully with ID:', templateData._id);
//             alert(`Шаблон анкеты "${templateTitle}" сохранен с тегом: ${templateTag}!`);
//             navigate('/Form_Template'); // Перенаправляем на FormTemplate
//         } catch (error) {
//             console.error('Error saving template:', error);
//         }
//     };
//     // const saveTemplate = async () => {
//     //     try {
//     //         const templateTag = generateTag(); // Генерируем тег
//     //         const templateData = {
//     //             _id: `template_${uuidv4()}`,
//     //             title: templateTitle, // Сохраняем название шаблона
//     //             formFields: formFields || [],
//     //             type: 'template',
//     //             tag: templateTag, // Сохраняем тег
//     //             createdAt: Date.now() // Добавляем дату и время создания
//     //         };
//     //         console.log('templateData before saving:', templateData); // Добавьте эту строку
//     //         await db.put(templateData);
//     //         alert(`Шаблон анкеты "${templateTitle}" сохранен с тегом: ${templateTag}!`);
//     //         navigate('/Form_Template'); // Перенаправляем на FormTemplate
//     //     } catch (error) {
//     //         console.error('Error saving template:', error);
//     //     }
//     // };

//     return (
//         <div className="new-form-container">
//             <Header></Header>
//             <div style={{flex: 4}}>
//                 <h2>Создать новый шаблон анкеты</h2>
//                 <div className="new-form-content"> {/* Add this element */}
//                     <div className="new-form-creation"> {/* Add this element */}
//                         <label>
//                             Название шаблона:
//                             <input
//                                 type="text"
//                                 value={templateTitle}
//                                 onChange={(e) => setTemplateTitle(e.target.value)}
//                             />
//                         </label>
//                         <AddTextField onAddField={addField} />
//                         <AddSelectField onAddField={addField} />
//                     </div>  {/* End left side */}

//                     {/* Form Preview */}
//                     <div className="form-preview-container">
//                         <h3>Предварительный просмотр:</h3>
//                         <FormPreview formFields={formFields} />
//                     </div> {/* End right side */}
//                 </div> {/* End content */}

//                 <button onClick={saveTemplate}>Сохранить шаблон</button>
//             </div>
//             <Footer></Footer>
//         </div>
//     );
// }

// export default New_Form;