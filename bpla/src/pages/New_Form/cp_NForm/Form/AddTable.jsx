import React, { useState } from "react"
import './AddTable.css'

export default function AddTable({ 
    handleAddTable
}) {
    const [tableName, setTableName] = useState('');
    const [newTableRows, setNewTableRows] = useState(3);
    const [newTableCols, setNewTableCols] = useState(3);

    const handleTableNameChange = (e) => {
        setTableName(e.target.value);
    };

    const createEmptyTableData = () => {
        return Array.from({ length: newTableRows }, () => 
            Array(newTableCols).fill('')
        );
    };

    const onCreateTable = (e) => {
        e.preventDefault();
        if (!tableName.trim()) {
            alert('Please enter a table name');
            return;
        }
        
        const newTableData = {
            tableName: tableName,
            tableData: createEmptyTableData()
        };
        
        handleAddTable(newTableData);
        setTableName('');
    };

    return (
        <div className="table-creation-settings">
            <label>
                Название таблицы:
                <input
                    type="text"
                    value={tableName}
                    onChange={handleTableNameChange}
                    required
                />
            </label>
            <label>
                Количество строк:
                <input
                    type="number"
                    min="1"
                    value={newTableRows}
                    onChange={(e) => setNewTableRows(Math.max(1, parseInt(e.target.value, 10) || 2))}
                />
            </label>
            <label>
                Количество столбцов:
                <input
                    type="number"
                    min="1"
                    value={newTableCols}
                    onChange={(e) => setNewTableCols(Math.max(1, parseInt(e.target.value, 10) || 2))}
                />
            </label>
            <button onClick={onCreateTable}>Добавить таблицу</button>
        </div>
    )
}