const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware
const dataService = require('./services/guests');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Use the cors middleware to enable CORS
app.use(bodyParser.json());


// Endpoint to insert a record
app.post('/records', async (req, res) => {
    try {
        console.log(req.body)
        const newRecordId = await dataService.insertRecord(req.body);
        res.json({ id: newRecordId, message: 'Record inserted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error inserting the record' });
    }
});

// Endpoint to update a record
app.put('/records/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const updated = await dataService.updateRecord(id, req.body);
        if (updated) {
            res.json({ message: 'Record updated successfully' });
        } else {
            res.status(404).json({ error: 'Record not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error updating the record' });
    }
});

// Endpoint to delete a record
app.delete('/records/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const deleted = await dataService.deleteRecord(id);
        if (deleted) {
            res.json({ message: 'Record deleted successfully' });
        } else {
            res.status(404).json({ error: 'Record not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error deleting the record' });
    }
});

// Endpoint to select records with pagination
app.get('/records', async (req, res) => {
    const pageIndex = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    try {
        const records = await dataService.selectRecords(pageIndex, pageSize);
        res.json(records);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error retrieving records' });
    }
});

app.get('/records/:id', async (req, res) => {
   let id = req.params.id;
    try {
        const records = await dataService.getRecordById(id);
        res.json(records);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error retrieving records' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
