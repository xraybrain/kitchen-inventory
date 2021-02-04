const express = require('express');
const cors = require('cors');
require('dotenv').config();
const morgan = require('morgan');
const http = require('http');
const expressJWT = require('express-jwt');
const path = require('path');
const app = express();
const jwt = require('json-web-token');

app.use(express.static(path.resolve(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(
  expressJWT({
    secret: process.env.JWT_SECRET,
    algorithms: ['sha1', 'RS256'],
    credentialsRequired: false,
  }).unless({
    path: ['/api/auth/login'],
  }),
  (err, req, res, next) => {
    console.log(err);
    next();
  }
);

// load routes and register routes
const authRoutes = require('./server/routes/auth.routes');
app.use('/api/', authRoutes);
const userRoutes = require('./server/routes/user.routes');
app.use('/api/', userRoutes);
const inventoryRoutes = require('./server/routes/inventory.routes');
app.use('/api/', inventoryRoutes);
const productCategoryRoutes = require('./server/routes/product_category.routes');
app.use('/api/', productCategoryRoutes);
const productRoutes = require('./server/routes/product.routes');
app.use('/api/', productRoutes);
const orderRoutes = require('./server/routes/order.routes');
app.use('/api/', orderRoutes);
const restockRoutes = require('./server/routes/restock.routes');
app.use('/api/', restockRoutes);

app.all('*', (req, res, next) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

const server = http.createServer(app);
const PORT = process.env.PORT;

server.listen(PORT, () => console.log(`Server API listening on port::${PORT}`));
