// const { config } = require('dotenv');
const express = require('express');
const app = express();

require('dotenv/config');

const api = process.env.API_URL;
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

app.use(cors());
app.options('*', cors());

// router
const productsRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');
const ordersRouter = require('./routers/orders');
const usersRouter = require('./routers/users');

app.use(express.json());
app.use(morgan('tiny'));
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);

// models
const Product = require('./models/product'); 
const Category = require('./models/category'); 
const Order = require('./models/order'); 
const User = require('./models/user'); 


mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eccomerce'
})
.then(() => {
    console.log('success mongo');
})
.catch((error) => {
    console.log(error);
});

app.listen(3000, () => {
    console.log(api);
    console.log('porta hapur');
});