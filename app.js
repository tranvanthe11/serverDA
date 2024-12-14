const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const fs = require("fs");
const authJwt = require('./helper/jwt');

app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());
app.use(express.json());
// app.use(authJwt());

//routes
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brand');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/user');
const productSizeRoutes = require('./routes/productSize');
const productColorRoutes = require('./routes/productColor');
const cartRoutes = require('./routes/cart');
const productReviewsRoutes = require('./routes/productReviews');
const myListRoutes = require('./routes/myList');
const ordersRoutes = require('./routes/orders');
const homeBannerRoutes = require('./routes/homeBanner');
const leftBannerRoutes = require('./routes/leftBanner');
const revenueAndProfitRoutes = require('./routes/revenueAndProfit');
const addressestRoutes = require('./routes/addresses');

app.use('/upload', express.static("upload"))
app.use('/api/category', categoryRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/productSize', productSizeRoutes);
app.use('/api/productColor', productColorRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/productReviews', productReviewsRoutes);
app.use('/api/myList', myListRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/homeBanner', homeBannerRoutes);
app.use('/api/leftBanner', leftBannerRoutes);
app.use('/api/revenue-and-profit', revenueAndProfitRoutes);
app.use('/api/addresses', addressestRoutes);

// mongoose.connect(process.env.CONNECTION_STRING, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
// })

mongoose.connect('mongodb+srv://Tranvanthe:kbpLqxPxr8VYX3fB@ac-ulpsapy.6eyckfe.mongodb.net/shopping?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
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

