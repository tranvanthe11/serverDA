const express = require('express');
const router = express.Router();
const {User} = require('../models/user');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

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
  
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
      });

      await Promise.all(uploadPromises);

      return res.send({ images: imagesArr });
      
    } catch (error) {
      console.log(error);
      return res.status(500).send("Lỗi trong quá trình tải ảnh lên Cloudinary");
    }
});

router.post(`/signup`, async (req, res) => {
    const {name, phone, email, password, isAdmin, isBlock} = req.body;

    try{
        const existingUser = await User.findOne({email: email})
        const existingUserByPhone = await User.findOne({phone: phone})
        if(existingUser) {
            return res.status(400).json({status: false, msg:"Email dã tồn tại"})
        }
        if(existingUserByPhone) {
            return res.status(400).json({status: false, msg:"Số điện thoại dã tồn tại"})
        }
        const hashPassword = await bcrypt.hash(password, 10);

        const result = await User.create({
            name:name,
            phone: phone,
            email: email,
            password: hashPassword,
            isAdmin: req.body.isAdmin,
            isBlock: req.body.isBlock
        });

        const token = jwt.sign({email:result.email, id: result._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);

        res.status(200).json({
            user: result,
            token: token
        })
    }catch(error){
        console.log(error);
        res.status(500).json({status: false, msg: "something went wrong"})
    }
})

router.post(`/signin`, async (req, res) => {
    const {email, password} = req.body;

    try{
        const existingUser = await User.findOne({email: email});
        if(!existingUser){
            return res.status(404).json({status: false, msg:"Tài khoản không đúng"})
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);

        if(!matchPassword){
            return res.status(400).json({status: false, msg: "Mật khẩu không đúng"})
        }

        const token = jwt.sign({email:existingUser.email, id:existingUser._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);

        return res.status(200).json({
            user: existingUser,
            token: token,
            msg: "User Authenticated"
        })
    } catch(error) {
        console.log(error);
         return res.status(500).json({status: false, msg: "something went wrong"})
    }
})

router.put(`/changePassword/:id`, async (req, res) => {
    const {name, phone, email, password, newPass} = req.body;
    const existingUser = await User.findOne({email: email});
        if(!existingUser){
            return res.status(404).json({status: false, msg:"Tài khoản không đúng"})
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);

        if(!matchPassword){
            return res.status(400).json({status: false, msg: "Mật khẩu không đúng"})
        }else{

            let newPassword
            if(newPass){
                newPassword = bcrypt.hashSync(newPass, 10)
            }else{
                newPassword = existingUser.passwordHash
            }
    
            const user = await User.findByIdAndUpdate(
                req.params.id,
                {
                    name:name,
                    phone:phone,
                    email:email,
                    password:newPassword,
                },
                {new: true}
            )
    
            if(!user)
                return res.status(400).send('the user canot be updated')
    
            return res.send(user)
        }

})



router.get(`/`, async (req, res) => {
    const userList = await User.find().sort({ createdAt: -1 });;

    if(!userList) {
        res.status(500).json({success: false})
    }
    return res.send(userList)
})

router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return res.status(500).json({message: 'the user with the iven id was not found'})
    }
    return res.status(200).send(user)
})

router.delete('/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id).then(user => {
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        }else{
            return res.status(404).json({success: false, message: 'user not found'})

        }
    }).catch(err=>{
        return res.status(500).json({success: false, error: err})

    })
})

router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments((count) => count)
    if(!userCount){
        return res.status(500).json({success: false})
    }
    return res.send({
        userCount: userCount
    })
})

// router.put('/:id', async(req, res)=>{
//     const {name, phone, email, isAdmin, isBlock} = req.body;
//     const userExist = await User.findById(req.params.id);
//     let newPassword
//     if(req.body.password){
//         newPassword = bcrypt.hashSync(req.body.password, 10)
//     } else {
//         newPassword = userExist.passwordHash;
//     }

//     const user = await User.findByIdAndUpdate(
//         req.params.id,
//         {
//             name:name,
//             phone:phone,
//             email:email,
//             password:newPassword,
//             isAdmin: isAdmin,
//             isBlock: isBlock,
//             images:imagesArr,
//         },
//         {new: true}
//     )

//     if(!user)
//         return res.status(400).send('the user canot be updated')

//     return res.send(user)
// })

router.put('/:id', async(req, res)=>{
    const {name, phone, email} = req.body;
    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name:name,
            phone:phone,
            email:email,
            // password:newPassword,
            // isAdmin: isAdmin,
            // isBlock: isBlock,
            images:imagesArr,
        },
        {new: true}
    )

    if(!user)
        return res.status(400).send('the user canot be updated')

    return res.send(user)
})

router.put('/status/:id', async (req,res)=>{


    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            phone:req.body.phone,
            email:req.body.email,
            isAdmin:req.body.isAdmin,
            isBlock:req.body.isBlock,
        },
        {new:true}
    )

    if(!user){
        return res.status(500).json({
            message:'user cannot be updated',
            success:false
        })
    }


    return res.send(user);
})

module.exports = router;