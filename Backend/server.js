const express = require('express');
const cors = require('cors');  
const { pool, initDatabase } = require('./database'); 
const transactionsRouter = require('./routes/transactions'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', transactionsRouter);

app.get('/', (req, res) => {
    res.json({ message: 'Expense Tracker API is running successfully!' });
});

async function startServer() {
    try {
        await initDatabase();

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
    }
}

startServer();