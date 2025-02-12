import React, { useState, useEffect } from 'react';
import './Table_Form.css';

function Table_Form({ tableData, onTableChange }) {

    const handleCellChange = (rowIndex, colIndex, value) => {
        const newTableData = [...tableData];
        newTableData[rowIndex][colIndex] = value;
        onTableChange(newTableData); //  Сообщаем об изменении данных
    };

    return (
        <div className="table-form">
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
        </div>
    );
}

export default Table_Form;