const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


const userRoutes = require('./routes/userRoutes.js');
const placeRoutes = require('./routes/placeRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');


app.use('/users', userRoutes);
app.use('/places', placeRoutes);
app.use('/categories', categoryRoutes);
app.use('/favorites', favoriteRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'Aow Ngai Dee Wa API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!', error: err.message });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});