import React, { useState, useEffect } from 'react';
import './Table_Form.css';

function Table_Form({ tableData, onTableChange, onDeleteTable, index, tableName }) { // Добавили onDeleteTable и index
    const handleCellChange = (rowIndex, colIndex, value) => {
        const newTableData = tableData.map((row, i) =>
            i === rowIndex ? row.map((cell, j) => (j === colIndex ? value : cell)) : row
        );
        onTableChange(newTableData);
    };

    return (
        <div className="table-form">
            <label>{tableName}:</label>
            <table>
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

