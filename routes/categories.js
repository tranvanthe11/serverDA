const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

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
var categoryEditId;

const removeVietnameseTones = (str) => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/\s+/g, '');
};

const storage = multer.memoryStorage();


const upload = multer({ storage: storage })

router.post('/upload', upload.array("images"), async (req, res) => {
    try {
      if (categoryEditId !== undefined) {
        const category = await Category.findById(categoryEditId);
        const images = category.images;
  
        if (images.length !== 0) {
          for (let image of images) {
            const publicId = image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          }
        }
      }
  
      imagesArr = [];
      const files = req.files;

      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (error) {
                return reject(error);
              }
              imagesArr.push(result.secure_url);
              resolve();
            }
          );
  
          // Chuyển buffer thành stream và đẩy vào uploadStream
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
      });

      // Chờ tất cả ảnh tải lên xong
      await Promise.all(uploadPromises);

      return res.send({ images: imagesArr });
      
    } catch (error) {
      console.log(error);
      return res.status(500).send("Lỗi trong quá trình tải ảnh lên Cloudinary");
    }
});
  


router.get('/', async (req, res) => {

    try{
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        const totalPosts = await Category.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
        if (page > totalPages) {
            return res.status(404).json({ message: "Page not found"})
        }
    
        const categoryList = await Category.find()
            .skip((page -1) * perPage)
            .limit(perPage)
            .exec();
    
        if(!categoryList) {
            return res.status(500).json({ success: false})
        }
        
        return res.status(200).json({
            "categoryList":categoryList,
            "totalPages":totalPages,
            "page":page
        })

    }catch(error){
        return res.status(500).json({ success: false})
    }

})

router.get('/:id', async (req, res) => {
    categoryEditId=req.params.id;
    const category = await Category.findById(req.params.id);

    if(!category) {
        return res.status(500).json({ message: 'The category with the given id was not found.'})
    }
    
    return res.status(200).send(category);
})

router.delete('/:id', async (req, res) => {


    const deleteUser = await Category.findByIdAndDelete(req.params.id);

    if(!deleteUser){
        return res.status(404).json({
            message: 'Category not find',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Category deleted!'
    })
})


router.post('/create', async (req, res) => {

    let category = new Category({
        name:req.body.name,
        nameNoAccent: removeVietnameseTones(req.body.name),
        images:imagesArr,
        color:req.body.color
    })
    
    if(!category){
        return res.status(500).json({
            error: err,
            success: false
        })
    }
    category = await category.save();


    return res.status(201).json(category);


})

router.put('/:id', async (req,res)=>{

    let updatedImages = req.body.images || [];


    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            nameNoAccent: removeVietnameseTones(req.body.name),
            images:updatedImages,
            color:req.body.color
        },
        {new:true}
    )

    if(!category){
        return res.status(500).json({
            message:'Category cannot be updated',
            success:false
        })
    }

    return res.send(category);
})

module.exports = router;