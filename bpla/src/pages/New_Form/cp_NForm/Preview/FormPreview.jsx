import React, { useState } from 'react';
import './FormPreview.css';

function FormPreview({ formFields, tableDataArray, onDeleteField, onDeleteTable, handleFileChange }) {
    let currentSelectLabel = null; // Track label for current select field

    return (
        <div className="form-preview">
            <h3>Предварительный просмотр формы</h3>

            {formFields.map(field => {
                const shouldDisplayLabel =
                    (field.type === 'image' || field.type === 'video') &&
                    field.relatedOption && // Check if field is related to select option
                    currentSelectLabel !== field.label; // Check if label has already been displayed

                if (shouldDisplayLabel) {
                    currentSelectLabel = field.label; // Set current label to prevent duplicate display
                }

                return (
                    <div key={field.id} className="form-field-preview">
                        {field.type === 'text' && (
                            <>
                                <label>{field.label}:</label>
                                <input type="text" />
                            </>
                        )}
                        {field.type === 'select' && (
                            <>
                                <label>{field.label}:</label>
                                <select>
                                    <option value="">Выберите...</option>
                                    {field.options && field.options.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </>
                        )}
                        {(field.type === 'image' || field.type === 'video') && (
                            <div>
                                {shouldDisplayLabel && <label>{field.label}:</label>}
                                <input
                                    type="file"
                                    accept={field.type === 'image' ? "image/*" : "video/*"}
                                    onChange={(e) => handleFileChange(field.id, e.target.files[0])}
                                />
                                {field.value && (
                                    field.type === 'image' ? (
                                        <img src={field.value} alt={field.label} style={{ maxWidth: '200px' }} />
                                    ) : (
                                        <video width="320" height="240" controls>
                                            <source src={field.value} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    )
                                )}
                                {field.relatedOption && (
                                    <label>Вариант: {field.relatedOption}</label> // Display related option
                                )}
                            </div>
                        )}
                        <button onClick={() => onDeleteField(field.id)}>Удалить поле</button>
                    </div>
                );
            })}

            {/* Отображение таблиц */}
            {tableDataArray && tableDataArray.length > 0 && (
                tableDataArray.map((tableData, index) => (
                    <div key={index} className="table-preview">
                        <table>
                            <tbody>
                                {tableData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, colIndex) => (
                                            <td key={colIndex}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => onDeleteTable(index)}>Удалить таблицу</button>
                    </div>
                ))
            )}
        </div>
    );
}

export default FormPreview;

// function FormPreview({ formFields, tableDataArray, onDeleteField, onDeleteTable, handleFileChange }) {
//     return (
//         <div className="form-preview">
//             <h3>Предварительный просмотр формы</h3>
//             {formFields.map((field) => (
//                 <div key={field.id} className="form-field-preview">
//                     <label>{field.label}:</label>
//                     {field.type === 'text' && <input type="text" />}
//                     {field.type === 'select' && (
//                         <select>
//                             <option value="">Выберите...</option>
//                             {field.options && field.options.map((option, index) => (
//                                 <option key={index} value={option}>{option}</option>
//                             ))}
//                         </select>
//                     )}
//                     {field.type === 'image' && (
//                         <div>
//                             <input
//                                 type="file"
//                                 accept="image/*"
//                                 onChange={(e) => handleFileChange(field.id, e.target.files[0])}
//                             />
//                             {field.value && (
//                                 <img src={field.value} alt={field.label} style={{ maxWidth: '200px' }} />
//                             )}
//                         </div>
//                     )}
//                     {field.type === 'video' && (
//                         <div>
//                             <input
//                                 type="file"
//                                 accept="video/*"
//                                 onChange={(e) => handleFileChange(field.id, e.target.files[0])}
//                             />
//                             {field.value && (
//                                 <video width="320" height="240" controls>
//                                     <source src={field.value} type="video/mp4" />
//                                     Your browser does not support the video tag.
//                                 </video>
//                             )}
//                         </div>
//                     )}
//                     <button onClick={() => onDeleteField(field.id)}>Удалить поле</button>
//                 </div>
//             ))}

//             {/* Отображение таблиц */}
//             {tableDataArray && tableDataArray.length > 0 && (
//                 tableDataArray.map((tableData, index) => (
//                     <div key={index} className="table-preview">
//                         <table>
//                             <tbody>
//                                 {tableData.map((row, rowIndex) => (
//                                     <tr key={rowIndex}>
//                                         {row.map((cell, colIndex) => (
//                                             <td key={colIndex}>{cell}</td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                         <button onClick={() => onDeleteTable(index)}>Удалить таблицу</button> {/* Добавляем кнопку */}
//                     </div>
//                 ))
//             )}
//         </div>
//     );
// }

// export default FormPreview;

// function FormPreview({ formFields, tableDataArray, onDeleteField, onDeleteTable }) {
//     return (
//         <div className="form-preview">
//             {formFields.map((field) => (
//                 <div key={field.id} className="form-field-preview">
//                     <label>{field.label}:</label>
//                     {field.type === 'text' && <input type="text" />}
//                     {field.type === 'select' && (
//                         <select>
//                             {field.options.map((option, index) => (
//                                 <option key={index}>{option}</option>
//                             ))}
//                         </select>
//                     )}
//                     <button onClick={() => onDeleteField(field.id)}>Удалить поле</button>
//                 </div>
//             ))}

//             {/* Отображение таблиц */}
//             {tableDataArray && tableDataArray.length > 0 && (
//                 tableDataArray.map((tableData, index) => (
//                     <div key={index} className="table-preview">
//                         <table>
//                             <tbody>
//                                 {tableData.map((row, rowIndex) => (
//                                     <tr key={rowIndex}>
//                                         {row.map((cell, colIndex) => (
//                                             <td key={colIndex}>{cell}</td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                         <button onClick={() => onDeleteTable(index)}>Удалить таблицу</button> {/* Добавляем кнопку */}
//                     </div>
//                 ))
//             )}
//         </div>
//     );
// }

// export default FormPreview;

// function FormPreview({ formFields, onDeleteField }) {
//   return (
//     <div className="form-preview">
//       {formFields.map((field) => (
//         <div key={field.id} className="form-field-preview">
//            <label>{field.label}:</label>
//            {field.type === 'text' && <input type="text" />}
//            {field.type === 'select' && (
//               <select>
//                  {field.options.map((option, index) => (
//                     <option key={index}>{option}</option>
//                  ))}
//               </select>
//            )}
//            <button onClick={() => onDeleteField(field.id)}>Удалить</button>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default FormPreview;