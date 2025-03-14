import React, { useRef } from 'react';
import Table_Form from '../Table_Form/Table_Form';
import './FormPreview.css';

function FormPreview({ formFields, tableDataArray, onDeleteField, onDeleteTable, handleFileChange, onTableChange }) {
    return (
        <div className="form-preview">
            <h3>Предварительный просмотр формы</h3>
            {formFields.map((field) => (

                <div key={field.id} className="form-field-preview">
                    <label>{field.label}:</label>
                    {field.type === 'text' && <input type="text" />}
                    {field.type === 'select' && (
                        <select>
                            <option value="">Выберите...</option>
                            {field.options && field.options.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                    )}
                    {field.type === 'image' && (
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(field.id, e.target.files[0])}
                            />
                            {field.value && (
                                <img src={field.value} alt={field.label} style={{ maxWidth: '200px' }} />
                            )}
                        </div>
                    )}
                    {field.type === 'video' && (
                        <div>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleFileChange(field.id, e.target.files[0])}
                            />
                            {field.value && (
                                <video width="320" height="240" controls>
                                    <source src={field.value} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                    )}
                    <button onClick={() => onDeleteField(field.id)}>Удалить поле</button>
                </div>
            ))}
            {tableDataArray && tableDataArray.length > 0 && (
                tableDataArray.map((tableData, index) => (
                    <Table_Form
                        key={index}
                        index={index}
                        tableName={tableData.tableName}
                        tableData={tableData.tableData}
                        onTableChange={(newTableData) => onTableChange(index, newTableData)} // <---- ОЧЕНЬ ВАЖНО
                        onDeleteTable={onDeleteTable}
                />
                ))
            )}
        </div>
    );
}

export default FormPreview;

