const express = require('express');
const router = express.Router();
const {Category} = require('../models/category');
const {Product} = require('../models/products');
const multer  = require('multer')
const fs = require("fs");

var imagesArr=[];
var productEditId;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "upload")
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`)
    }
  })

const upload = multer({ storage: storage })

router.post('/upload', upload.array("images"), async (req, res) => {
    let images;

    if(productEditId!==undefined){
        const product = await Product.findById(productEditId)
        
        if(product) {
            images = product.images;
        }

        if(images.length !==0){
            for(image of images){
                if (fs.existsSync(`upload/${image}`)) {
                    fs.unlinkSync(`upload/${image}`);
                }
            }
            productEditId="";
        }
    }
    imagesArr=[];
    const files = req.files;

    for(let i=0; i<files.length; i++) {
        imagesArr.push(files[i].filename);
    }

    res.send(imagesArr);

})

router.get('/', async (req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const totalPosts = await Product.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    if (page > totalPages) {
        return res.status(404).json({ message: "Page not found"})
    }

    const productList = await Product.find().populate("category brand")
            .skip((page -1) * perPage)
            .limit(perPage)
            .exec();

    // const productList = await Product.find().populate("category");

    if(!productList){
        res.status(500).json({success: false})
    }

    return res.status(200).json({
        "products":productList,
        "totalPages":totalPages,
        "page":page
    })
    res.send(productList);
})

router.get('/:id', async (req, res) => {

    productEditId = req.params.id;
    const product = await Product.findById(req.params.id).populate("category brand")

    if(!product) {
        res.status(500).json({ message: 'The product with the given id was not found.'})
    }
    
    return res.status(200).send(product);
})

router.post('/create', async (req,res)=>{
    
    const category = await Category.findById(req.body.category);
    if(!category){
        return res.status(404).send("invalid Category!");
    }


    let product = new Product({
        name:req.body.name,
        description:req.body.description,
        // brand:req.body.brand,
        price:req.body.price,
        discount:req.body.discount,
        category:req.body.category,
        brand:req.body.brand,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        isPromotion:req.body.isPromotion,
        dateCreated:req.body.dateCreated,
        images:imagesArr
    });

    product = await product.save();
    if(!product){
        res.status(500).json({
            error: err,
            success: false
        })
    }
    res.status(201).json(product);
})

router.delete('/:id', async(req,res)=>{

    const product = await Product.findById(req.params.id);
    const images = product.images;

    if(images.length!==0){
        for(image of images){
            fs.unlinkSync(`upload/${image}`);
        }
    }

    const deleteProduct = await Product.findByIdAndDelete(req.params.id);
    if(!deleteProduct){
        return res.status(404).json({
            message: "product not found",
            status: false
        })
    }

    res.status(200).send({
        message: "the product is deleted",
        status: true
    })
})

router.put('/:id', async(req,res)=>{

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            description:req.body.description,
            // brand:req.body.brand,
            price:req.body.price,
            discount:req.body.discount,
            category:req.body.category,
            brand:req.body.brand,
            countInStock:req.body.countInStock,
            rating:req.body.rating,
            isPromotion:req.body.isPromotion,
            dateCreated:req.body.dateCreated,
            images:imagesArr,
        },
        {new: true}
    );

    if(!product){
        res.status(404).json({
            message: 'the product can not is updated',
            status: false
        })
    }

    res.status(200).json({
        message: 'the product is updated',
        status: true
    })
})



module.exports = router;