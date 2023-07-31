const mysql = require('mysql2');

// MySQL configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'SQLAdmin',
    database: 'sampleExternalData',
};

// Function to create a connection pool
const pool = mysql.createPool(dbConfig);

// Function to insert a record
function insertRecord(data) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO guests (name, age, title) VALUES (?, ?, ?)';
        const values = [data.name, data.age, data.title];

        pool.query(query, values, (error, results) => {
            if (error) {
                console.error('Error inserting record:', error);
                reject(error);
                return;
            }

            resolve(results.insertId);
        });
    });
}

// Function to update a record
function updateRecord(id, data) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE guests SET name = ?, age = ?, title = ? WHERE id = ?';
        const values = [data.name, data.age, data.title, id];

        pool.query(query, values, (error, results) => {
            if (error) {
                console.error('Error updating record:', error);
                reject(error);
                return;
            }

            resolve(results.affectedRows > 0);
        });
    });
}

// Function to delete a record
function deleteRecord(id) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM guests WHERE id = ?';
        pool.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error deleting record:', error);
                reject(error);
                return;
            }

            resolve(results.affectedRows > 0);
        });
    });
}

function getRecordById(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, name, age, title FROM guests WHERE id = ?';
        pool.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error getting record by ID:', error);
                reject(error);
                return;
            }

            if (results.length === 0) {
                // Record with the specified ID not found
                resolve(null);
            } else {
                // Found the record, return it
                resolve(results[0]);
            }
        });
    });
}
// Function to select records with pagination
function selectRecords(pageIndex, pageSize) {
    return new Promise((resolve, reject) => {
        const offset = (pageIndex - 1) * pageSize;
        const query = 'SELECT id, name, age, title FROM guests LIMIT ?, ?';
        const countQuery = 'SELECT COUNT(*) AS totalCount FROM guests';

        // Fetch total count and paginated data in parallel using Promise.all
        Promise.all([
            new Promise((resolve, reject) => {
                pool.query(countQuery, (error, results) => {
                    if (error) {
                        console.error('Error retrieving total count:', error);
                        reject(error);
                        return;
                    }
                    const totalCount = results[0].totalCount;
                    resolve(totalCount);
                });
            }),
            new Promise((resolve, reject) => {
                pool.query(query, [offset, pageSize], (error, results) => {
                    if (error) {
                        console.error('Error selecting records:', error);
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            }),
        ])
            .then(([totalCount, paginatedData]) => {
                const response = {
                    totalCount,
                    pageSize:pageSize,
                    page:pageIndex,
                    items: paginatedData,
                };
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
module.exports = {
    insertRecord,
    updateRecord,
    deleteRecord,
    selectRecords,
    getRecordById
};
