const express = require('express');

const cors = require('cors');

const mysql = require('mysql2');

const app=express();

app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


db.connect((err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("connected with database");
    }
});



app.get('/',(req,res)=>{
    console.log("Default route")
    db.query('select * from todoItems',(err,result)=>{
       
        if(err){
            console.log("error occured",err);
            return
        }
        console.log("Data:",result);
        res.send(result);
    })    

});




// Add item
// Add item
app.post('/add-item', (req, res) => {
    const text = req.body.text;
    console.log('Adding item:', text);

    db.query(
        'INSERT INTO todoItems (itemDescription) VALUES (?)',
        [text],
        (err, results) => {
            if (err) {
                console.error('Error occurred:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            console.log('Inserted into DB successfully');

            // ✅ Return proper JSON (with the new ID and text)
            res.json({
                Id: results.insertId,
                itemDescription: text
            });
        }
    );
});



// Update
app.put('/edit-item', (req, res) => {
    const { ID, text, itemDescription } = req.body;
    const updatedText = text || itemDescription; // accept either field name

    if (!ID || !updatedText) {
        console.log("Invalid data received:", req.body);
        return res.status(400).json({ error: "ID and text are required" });
    }

    const query = `UPDATE todoItems SET itemDescription = ? WHERE ID = ?`;
    db.query(query, [updatedText, ID], (err, results) => {
        if (err) {
            console.error("Error occurred:", err);
            return res.status(500).send("Database error");
        }
        console.log(`Edited successfully: ID=${ID}, text=${updatedText}`);
        res.json({ success: true, ID, text: updatedText });
    });
});




app.delete('/delete', (req, res) => {
    const { ID } = req.body;
    console.log('Deleting ID:', ID);

    const query = `DELETE FROM todoItems WHERE ID = ?`;
    db.query(query, [ID], (err, results) => {
        if (err) {
            console.log('Error deleting item:', err);
            return res.status(500).send('Database error');
        }
        console.log('Deleted successfully');
        res.json({ success: true });
    });
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});