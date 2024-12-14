const { LeftBanner } = require('../models/leftBanner');
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

const storage = multer.memoryStorage();

const upload = multer({ storage: storage })

router.post('/upload', upload.array("images"), async (req, res) => {
    try {
  
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
    
        const bannerList = await LeftBanner.find();
    
        if(!bannerList) {
            return res.status(500).json({ success: false})
        }
        
        return res.status(200).json(bannerList)

    }catch(error){
        return res.status(500).json({ success: false})
    }

})

router.get('/:id', async (req, res) => {
    const item = await LeftBanner.findById(req.params.id);

    if(!item) {
        return res.status(500).json({ message: 'The item with the given id was not found.'})
    }
    
    return res.status(200).send(item);
})

router.delete('/:id', async (req, res) => {


    const Item = await LeftBanner.findByIdAndDelete(req.params.id);

    if(!Item){
        return res.status(404).json({
            message: 'Slide not find',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Slide deleted!'
    })
})


router.post('/create', async (req, res) => {

    let newEntry = new LeftBanner({
        images:imagesArr,
    })
    
    if(!newEntry){
        return res.status(500).json({
            error: err,
            success: false
        })
    }
    newEntry = await newEntry.save();


    return res.status(201).json(newEntry);


})

router.put('/:id', async (req,res)=>{

    let updatedImages = req.body.images || [];

    const slideItem = await LeftBanner.findByIdAndUpdate(
        req.params.id,
        {
            images:updatedImages,
        },
        {new:true}
    )

    if(!slideItem){
        return res.status(500).json({
            message:'Slide cannot be updated',
            success:false
        })
    }

    return res.send(slideItem);
})

module.exports = router;