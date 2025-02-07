import React, { useState, useEffect } from 'react';
import { useNavigate, Link , useLocation} from 'react-router-dom';
import db from '../../PouchDB/pouchdb';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import './Saved_Form.css';
import Confirmation_Dialog from '../Form/cp_Form/Confirmation_Dialog/Confirmation_Dialog';

function Saved_Form() {
    const [savedForms, setSavedForms] = useState([]);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [formToDelete, setFormToDelete] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const loadSavedForms = async () => {
            try {
                const forms = await db.allDocs({
                    include_docs: true,
                    selector: { type: 'form' },
                });
                setSavedForms(forms.rows.map(row => row.doc));
            } catch (error) {
                console.error('Error loading saved forms:', error);
            }
        };

        loadSavedForms();
    }, []);

    const handleDeleteForm = async (formId) => {
        setFormToDelete(formId);
        setShowConfirmationDialog(true);
    };


    const handleConfirmation = async (confirmed) => {
        setShowConfirmationDialog(false);
        if (confirmed) {
            try {
                await db.get(formToDelete).then(doc => db.remove(doc));
                const updatedForms = savedForms.filter(form => form._id !== formToDelete);
                setSavedForms(updatedForms);
                alert('Анкета успешно удалена!');
            } catch (error) {
                console.error('Error deleting form:', error);
                alert('Ошибка при удалении анкеты!');
            }
        }
    };

    return (
        <div className="saved-forms-container">
            <Header></Header>
            <h1>Сохраненные анкеты</h1>
            <ul>
                {savedForms.map((form) => (
                    <li key={form._id}>
                        <div>
                            <h2>{form.title}</h2>
                            <p>Тег: {form.tag}</p>
                            <p>
                                Дата создания: {new Date(form.createdAt).toLocaleString()}
                            </p>
                            {form.lastEditedAt && (
                                <p>
                                    Дата последнего редактирования: {new Date(form.lastEditedAt).toLocaleString()}
                                </p>
                            )}
                            <Link to={{
                                pathname: `/view/${form._id}`,
                                state: { formData: form.formFields }  //  Передаем formData как state
                            }}>Посмотреть</Link>
                            <button onClick={() => handleDeleteForm(form._id)}>Удалить</button>
                        </div>
                    </li>
                ))}
            </ul>

            <Confirmation_Dialog
                isOpen={showConfirmationDialog}
                message={'Вы уверены, что хотите удалить анкету?'}
                onConfirm={() => handleConfirmation(true)}
                onClose={() => setShowConfirmationDialog(false)}
            />
            <Footer></Footer>
        </div>
    );
}

export default Saved_Form;

// function Saved_Form() {
//     const [savedForms, setSavedForms] = useState([]);
//     const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
//     const [formToDelete, setFormToDelete] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const loadSavedForms = async () => {
//             try {
//                 const forms = await db.allDocs({
//                     include_docs: true,
//                     selector: { type: 'form' },
//                 });
//                 setSavedForms(forms.rows.map(row => row.doc));
//             } catch (error) {
//                 console.error('Error loading saved forms:', error);
//             }
//         };

//         loadSavedForms();
//     }, []);

//     const handleDeleteForm = async (formId) => {
//         setFormToDelete(formId);
//         setShowConfirmationDialog(true);
//     };


//     const handleConfirmation = async (confirmed) => {
//         setShowConfirmationDialog(false);
//         if (confirmed) {
//             try {
//                 await db.get(formToDelete).then(doc => db.remove(doc));
//                 const updatedForms = savedForms.filter(form => form._id !== formToDelete);
//                 setSavedForms(updatedForms);
//                 alert('Анкета успешно удалена!');
//             } catch (error) {
//                 console.error('Error deleting form:', error);
//                 alert('Ошибка при удалении анкеты!');
//             }
//         }
//     };

//     return (
//         <div className="saved-forms-container">
//             <Header></Header>
//             <h1>Сохраненные анкеты</h1>
//             <ul>
//                 {savedForms.map((form) => (
//                     <li key={form._id}>
//                         <div>
//                             <h2>{form.title}</h2>
//                             <p>Тег: {form.tag}</p>
//                             <button onClick={() => handleDeleteForm(form._id)}>Удалить</button>
//                         </div>
//                     </li>
//                 ))}
//             </ul>

//             <Confirmation_Dialog
//                 isOpen={showConfirmationDialog}
//                 message={'Вы уверены, что хотите удалить анкету?'}
//                 onConfirm={() => handleConfirmation(true)}
//                 onClose={() => setShowConfirmationDialog(false)}
//             />
//             <Footer></Footer>
//         </div>   
//     );
// }

// export default Saved_Form;