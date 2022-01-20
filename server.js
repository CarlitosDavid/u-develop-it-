const express = require('express');
const db = require('./db/connection');
const inputCheck = require('./utils/inputCheck');

const PORT = process.env.PORT || 3001;
const app = express();
const apiRoutes = require('./routes/apiRoutes');

// express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api', apiRoutes);



app.get('/api/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
    AS party_name 
    FROM candidates 
    LEFT JOIN parties 
    ON candidates.party_id = parties.id`;

    // get all candidates
    db.query(sql, (err, rows)=> {
        if (err) {
            res.status(500).json ({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    })
});

// get a single candidates
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
    AS party_name 
    FROM candidates 
    LEFT JOIN parties 
    ON candidates.party_id = parties.id 
    WHERE candidates.id = ?`;
    const params = [req.params.id];

    // get a single candidates
    db.query(sql, params, (err, row)=> {
        if (err) {
            res.status(400).json ({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    })
});

// create a candidate
app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    const sql =`INSERT INTO candidates (first_name, last_name, industry_connected, party_id)
        VALUES (?,?,?,?)`;
    const params = [ body.first_name, body.last_name, body.industry_connected, body.party_id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: body,
            changes: result.affectedRows
        });
    });
});

app.put('/api/candidate/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');
    if (errors) {
        res.status(400).json({ error: erros });
        return;
    }

    const sql = `UPDATE candidates SET party_id = ?
                WHERE id = ?`;
    const params = [ req.body.party_id, req.params.id];
    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else if (!result.affectedRows) {
            res.json({
                message: 'Candidate not found'
            });
        } else {
            res.json({
                message: 'success',
                data: req.body,
                changes: result.affectedRows
            });
        }
    });
});

// delete a candidate
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM parties WHERE id =`;
    const params = [req.params.id];

    db.query(sql, params, (err, result)=> {
        if (err) {
            res.statusMessage(400).json ({ error: err.message });
        } else if (!result.affectedRows) {
            res.json({
                message: 'Candidate not found'
            });
        } else {
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    })
});

// get all parties
app.get('/api/parties', (req, res) => {
    const sql = `SELECT * FROM parties`;
    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});



// get a single party
app.get ('/api/party/:id', (req, res) => {
    const sql = `SELECT * FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err. message });
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});
 
// delete a party
app.delete('.api/party/:id', (req, res) => {
    const sql = `DELETE FROM parties WHERE id = ?`;
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: res.message });
            // checks if anything was deleted
        } else if (!result.affectedRows) {
            res.json({ 
                message: 'Party not found'
            });
        } else { res.json ({
            message: 'deleted',
            changes: result.affectedRows,
            id: req.params.id
        });}
    });
});

// .Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

// connect to database 
db.connect(err => {
    if (err) throw err;
    console.log('Database connected.');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

// GET a single candidate
// db.query(`SELECT * FROM candidates WHERE id = 1`, (err, rows) => {
//     if (err) {
//         console.log(err);
//     }
//     console.log(rows);
// });

// Delete a candidate 
// db.query(`DELETE FROM candidates WHERE id = ?`, 1, (err, result) => {
//     if (err) {
//         console.log(err);
//     }
//     console.log(result);
// });
