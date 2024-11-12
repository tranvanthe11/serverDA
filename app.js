const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const fs = require("fs");

app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());

//routes
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brand');
const productRoutes = require('./routes/products');

app.use('/upload', express.static("upload"))
app.use('/api/category', categoryRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/products', productRoutes);

mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})
.then(()=>{
    console.log('database connection is ready...')
    //server
    app.listen(process.env.PORT, () => {
        console.log(`Server is running http://localhost:${process.env.PORT}`);
    })
})
.catch((err)=> {
    console.log(err);
})

