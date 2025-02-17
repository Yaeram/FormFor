import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import db from '../../../PouchDB/pouchdb';
import DisplayModeSection from '../../Form/cp_Form/DisplayModeSection/DisplayModeSection';
import EditSavedForm from '../EditSavedForm/EditSavedForm';
import './View_Form.css'; 

function View_Form() {
    const { formId } = useParams();
    const [formData, setFormData] = useState(null);
    const [tableDataArray, setTableDataArray] = useState([]);
    const [formTitle, setFormTitle] = useState('');
    const [formTag, setFormTag] = useState('');
    const [formCreatedAt, setFormCreatedAt] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const loadFormData = async () => {
            try {
                let initialFormData = [];
                let initialTableData = [];

                if (location.state && location.state.formData && location.state.tableData) {
                    initialFormData = location.state.formData;
                    initialTableData = location.state.tableData;
                    setFormData(initialFormData);
                    setTableDataArray(initialTableData);
                } else {
                    const form = await db.get(formId);
                    initialFormData = form.formFields;
                    initialTableData = form.tableData;
                    setFormData(initialFormData);
                    setTableDataArray(initialTableData);
                    setFormTitle(form.title);
                    setFormTag(form.tag);
                    setFormCreatedAt(form.createdAt);
                }
            } catch (error) {
                console.error('Error loading form data:', error);
            }
        };

        loadFormData();
    }, [formId, location.state]);

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const handleUpdateField = (fieldId, newLabel) => {
        setFormData(prevData =>
            prevData.map(field =>
                field.id === fieldId ? { ...field, label: newLabel } : field
            )
        );
    };

    const handleUpdateOptions = (fieldId, newOptions) => {
        setFormData(prevData =>
            prevData.map(field =>
                field.id === fieldId ? { ...field, options: newOptions } : field
            )
        );
    };

    const handleDeleteField = (fieldId) => {
        setFormData(prevData => prevData.filter(field => field.id !== fieldId));
    };

    const handleUpdateAnswer = (fieldId, newAnswer) => {
        setFormData(prevData =>
            prevData.map(field =>
                field.id === fieldId ? { ...field, answer: newAnswer } : field
            )
        );
    };

    const saveChanges = async () => {
        try {
            const doc = await db.get(formId);
            doc.formFields = formData;
            doc.tableData = tableDataArray;
            doc.lastEditedAt = Date.now();
            await db.put(doc);
            alert('Анкета успешно обновлена!');
            setIsEditMode(false);
            navigate('/Saved_Form');
        } catch (error) {
            console.error('Error saving form:', error);
            alert('Ошибка при сохранении анкеты!');
        }
    };

    if (!formData) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="view-form-container">
            <h1>{formTitle}</h1>
            <p>Тег: {formTag}</p>
            <p>Дата создания: {new Date(formCreatedAt).toLocaleString()}</p>

            {isEditMode ? (
                <EditSavedForm
                    formFields={formData}
                    onDeleteField={handleDeleteField}
                    onUpdateField={handleUpdateField}
                    onUpdateOptions={handleUpdateOptions}
                    onUpdateAnswer={handleUpdateAnswer}
                    saveChanges={saveChanges}
                />
            ) : (
                <DisplayModeSection formData={formData} handleInputChange={handleUpdateAnswer} />
            )}

            {/* Display tables */}
            {tableDataArray && tableDataArray.length > 0 && (
                tableDataArray.map((tableData, index) => (
                    <div key={index}>
                        <table>
                            <tbody>
                                {tableData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, colIndex) => (
                                            <td key={colIndex}>
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            )}

            <button onClick={toggleEditMode}>
                {isEditMode ? 'Отключить режим редактирования' : 'Включить режим редактирования'}
            </button>
        </div>
    );
}

export default View_Form;

// function View_Form() {
//     const { formId } = useParams();
//     const [formData, setFormData] = useState(null);
//     const [formTitle, setFormTitle] = useState('');
//     const [formTag, setFormTag] = useState('');
//     const [formCreatedAt, setFormCreatedAt] = useState(null);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const navigate = useNavigate();
//     const location = useLocation();
  
//     useEffect(() => {
//       const loadFormData = async () => {
//         try {
//           let initialFormData;
//           if (location.state && location.state.formData) {
//             initialFormData = location.state.formData;
//           } else {
//             const form = await db.get(formId);
//             initialFormData = form.formFields;
//             setFormTitle(form.title);
//             setFormTag(form.tag);
//             setFormCreatedAt(form.createdAt);
//           }
//           setFormData(initialFormData);
//         } catch (error) {
//           console.error('Error loading form data:', error);
//         }
//       };
  
//       loadFormData();
//     }, [formId, location.state]);
  
//     const toggleEditMode = () => {
//       setIsEditMode(!isEditMode);
//     };
  
//     const handleUpdateField = (fieldId, newLabel) => {
//       setFormData(prevData =>
//         prevData.map(field =>
//           field.id === fieldId ? { ...field, label: newLabel } : field
//         )
//       );
//     };
  
//     const handleUpdateOptions = (fieldId, newOptions) => {
//       setFormData(prevData =>
//         prevData.map(field =>
//           field.id === fieldId ? { ...field, options: newOptions } : field
//         )
//       );
//     };
  
//     const handleDeleteField = (fieldId) => {
//       setFormData(prevData => prevData.filter(field => field.id !== fieldId));
//     };
  
//     const handleUpdateAnswer = (fieldId, newAnswer) => {
//       setFormData(prevData =>
//         prevData.map(field =>
//           field.id === fieldId ? { ...field, answer: newAnswer } : field
//         )
//       );
//     };
  
//     const saveChanges = async () => {
//         try {
//             const doc = await db.get(formId);
//             doc.formFields = formData;
//             doc.lastEditedAt = Date.now(); // Add lastEditedAt
//             await db.put(doc);
//             alert('Анкета успешно обновлена!');
//             setIsEditMode(false);
//             navigate('/Saved_Form');
//         } catch (error) {
//             console.error('Error saving form:', error);
//             alert('Ошибка при сохранении анкеты!');
//         }
//     };
  
//     if (!formData) {
//       return <div>Загрузка...</div>;
//     }
  
//     return (
//       <div className="view-form-container">
//         <h1>{formTitle}</h1>
//         <p>Тег: {formTag}</p>
//         <p>Дата создания: {new Date(formCreatedAt).toLocaleString()}</p>
  
//         <button onClick={toggleEditMode}>
//           {isEditMode ? 'Перейти в режим просмотра' : 'Перейти в режим редактирования'}
//         </button>
  
//         {isEditMode ? (
//           <>
//             <EditSavedForm
//               formFields={formData}
//               onDeleteField={handleDeleteField}
//               onUpdateField={handleUpdateField}
//               onUpdateOptions={handleUpdateOptions}
//               onUpdateAnswer={handleUpdateAnswer}
//               saveChanges={saveChanges} //Pass saveChanges
//             />
  
//           </>
//         ) : (
//           <DisplayModeSection formData={formData} handleInputChange={() => { }} />
//         )}
//       </div>
//     );
//   }
  
//   export default View_Form;
