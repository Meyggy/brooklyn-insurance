const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/users', require('./routes/userRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/policies', require('./routes/policyRoutes'));
app.use('/claims', require('./routes/claimRoutes'));
app.use('/messages', require('./routes/messageRoutes'));
app.get('/', (req, res) => {
  res.send('Brooklyn Insurance API Running');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});