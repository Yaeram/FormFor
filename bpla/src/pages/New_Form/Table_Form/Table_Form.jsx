import React, { useState, useEffect } from 'react';
import './Table_Form.css';

// новый
// function Table_Form({ tableName, tableData, onTableChange, onDeleteTable, index }) { // <--- Убедись, что это есть
//     const handleCellChange = (rowIndex, colIndex, value) => {
//         const newTableData = tableData.map((row, i) =>
//             i === rowIndex ? row.map((cell, j) => (j === colIndex ? value : cell)) : row
//         );
//         onTableChange(newTableData);
//     };

//     return (
//         <div className="table-form">
//             <h3>{tableName}</h3>
//             <table>
//                 <tbody>
//                     {tableData.map((row, rowIndex) => (
//                         <tr key={rowIndex}>
//                             {row.map((cell, colIndex) => (
//                                 <td key={colIndex}>
//                                     <input
//                                         type="text"
//                                         value={cell}
//                                         onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
//                                     />
//                                 </td>      
//                             ))} 
//                         </tr>  
//                     ))}
//                     </tbody>
//                 </table>
//                 <button onClick={() => onDeleteTable(index)}>Удалить таблицу</button>
//             </div>
//         );
//     }

//     export default Table_Form;

function Table_Form({ tableData, onTableChange, onDeleteTable, index, tableName }) { // Добавили onDeleteTable и index
    const handleCellChange = (rowIndex, colIndex, value) => {
        const newTableData = tableData.map((row, i) =>
            i === rowIndex ? row.map((cell, j) => (j === colIndex ? value : cell)) : row
        );
        onTableChange(newTableData);
    };

    return (
        <div className="table-form">
            <table>
                <span>{tableName}</span>
                <tbody>
                    {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, colIndex) => (
                                <td key={colIndex}>
                                    <input
                                        type="text"
                                        value={cell}
                                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={() => onDeleteTable(index)}>Удалить таблицу</button> {/* Кнопка здесь */}
        </div>
    );
}

export default Table_Form;

