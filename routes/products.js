const express = require('express');
const router = express.Router();
const {Category} = require('../models/category');
const {Product} = require('../models/products');
const multer  = require('multer')
const fs = require("fs");

const streamifier = require('streamifier');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'ddysmtgos',
  api_key: '991825196762816',
  api_secret: 'I9h83_jaSlJlcvbeCNSISMTzx-E',
});

var imagesArr=[];
var productEditId;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

router.post('/upload', upload.array("images"), async (req, res) => {
    try {
      imagesArr = [];
  
      if (productEditId !== undefined) {
        const product = await Product.findById(productEditId);
        const images = product.images;
  
        if (images.length !== 0) {
          for (let image of images) {
            const publicId = image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          }
        }
  
        imagesArr = [];
      }
  
      const files = req.files;
  
      const tempImagesArr = [];
      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (error) return reject(error);
              tempImagesArr.push(result.secure_url);
              resolve();
            }
          );
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
      });
  
      await Promise.all(uploadPromises);
  
      imagesArr = [...tempImagesArr];
  
      console.log(imagesArr);
  
      return res.send({ images: imagesArr });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Lỗi trong quá trình tải ảnh lên Cloudinary");
    }
  });
  
  

router.get('/', async (req,res)=>{

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage);
    const totalPosts = await Product.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    if (page > totalPages) {
        return res.status(404).json({ message: "Page not found"})
    }

    let productList=[];

    if(req.query.minPrice !== undefined && req.query.maxPrice !== undefined){
        const minPrice = parseInt(req.query.minPrice, 10);
        const maxPrice = parseInt(req.query.maxPrice, 10);
    
        productList = await Product.find({
            catId: req.query.catId,
            price: { $gte: minPrice, $lte: maxPrice }
        }).populate("category brand")
        .sort({ createdAt: -1 });

        const filteredProducts = productList.filter(product => {
            if(req.query.minPrice && product.price < parseInt(+req.query.minPrice)){
                return false;
            }
            if(req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)){
                return false;
            }
            return true;
        })
        if(!productList){
            return res.status(500).json({success: false})
        }
    
        return res.status(200).json({
            "products":productList,
            "totalPages":totalPages,
            "page":page
        })

    } else {
        productList = await Product.find(req.query).populate("category brand").sort({ createdAt: -1 })

        if(!productList){
            return res.status(500).json({success: false})
        }
    
        return res.status(200).json({
            "products":productList,
            "totalPages":totalPages,
            "page":page
        })
    }
//     if(req.query.catName!==undefined){
//          productList = await Product.find({catName:req.query.catName}).populate("category brand")
//     }else{

//          productList = await Product.find().populate("category brand")
//                 .skip((page -1) * perPage)
//                 .limit(perPage)
//                 .exec();
//     }

//     if(req.query.catId!==undefined){
//         productList = await Product.find({catId:req.query.catId}).populate("category brand")
//    }else{

//         productList = await Product.find().populate("category brand")
//                .skip((page -1) * perPage)
//                .limit(perPage)
//                .exec();
//    }

    // if(req.query.brandName!==undefined){
    //     productList = await Product.find({brandName:req.query.brandName}).populate("category brand")
    //     }else{

    //             productList = await Product.find().populate("category brand")
    //                 .skip((page -1) * perPage)
    //                 .limit(perPage)
    //                 .exec();
    //     }



    // return res.send(productList);
})

router.get('/newProduct', async (req,res)=>{
    const productList = await Product.find({isNewProduct: true}).populate("category brand").sort({ createdAt: -1 });

    if(!productList){
        return res.status(500).json({success: false})
    }

    return res.status(200).json(productList)
})

router.get('/:id', async (req, res) => {

    productEditId = req.params.id;
    const product = await Product.findById(req.params.id).populate("category brand")

    if(!product) {
        return res.status(500).json({ message: 'The product with the given id was not found.'})
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
        price:req.body.price,
        discount:req.body.discount,
        catName:req.body.catName,
        catId:req.body.catId,
        brandName:req.body.brandName,
        category:req.body.category,
        brand:req.body.brand,
        rating:req.body.rating,
        isNewProduct:req.body.isNewProduct,
        dateCreated:req.body.dateCreated,
        images:imagesArr,
        sizesAndColors: req.body.sizesAndColors,
        sold:req.body.sold
    });

    product = await product.save();
    if(!product){
        return res.status(500).json({
            error: err,
            success: false
        })
    }
    // imagesArr=[];

    return res.status(201).json(product);
})

router.delete('/:id', async(req,res)=>{

    const deleteProduct = await Product.findByIdAndDelete(req.params.id);
    if(!deleteProduct){
        return res.status(404).json({
            message: "product not found",
            status: false
        })
    }

    return res.status(200).send({
        message: "the product is deleted",
        status: true
    })
})

router.put('/:id', async(req,res)=>{

    let updatedImages = req.body.images || [];

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            description:req.body.description,
            price:req.body.price,
            discount:req.body.discount,
            catName:req.body.catName,
            catId:req.body.catId,
            brandName:req.body.brandName,
            category:req.body.category,
            brand:req.body.brand,
            rating:req.body.rating,
            images:updatedImages,
            sizesAndColors: req.body.sizesAndColors,
            sold: req.body.sold
        },
        {new: true}
    );

    if(!product){
        return res.status(404).json({
            message: 'the product can not is updated',
            status: false
        })
    }

    // imagesArr=[];

    return res.status(200).json({
        message: 'the product is updated',
        status: true
    })
})



module.exports = router;