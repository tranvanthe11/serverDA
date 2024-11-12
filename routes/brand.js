const express = require('express');
const router = express.Router();
const {Category} = require('../models/category');
const {Brand} = require('../models/brand');

router.get('/', async (req, res) => {
    try{
        const brand = await Brand.find().populate("category")
        if(!brand){
            res.status(500).json({success: false})
        }
        return res.status(200).json(brand);
    }catch(error){
        res.status(500).json({ success: false})
    }
})

router.get('/:id', async (req, res) => {
    const brand = await Brand.findById(req.params.id).populate("category")

    if(!brand) {
        res.status(500).json({ message: 'The brand with the given id was not found.'})
    }
    
    return res.status(200).send(brand);
})

router.post('/create', async (req, res) => {

    let brand = new Brand({
        category:req.body.category,
        brand:req.body.brand,
    })
    brand = await brand.save();

    if(!brand){
        res.status(500).json({
            error: err,
            success: false
        })
    }


    res.status(201).json(brand);


})

router.delete('/:id', async (req, res) => {

    const deleteBrand = await Brand.findByIdAndDelete(req.params.id);

    if(!deleteBrand){
        res.status(404).json({
            message: 'Brand not find',
            success: false
        })
    }

    res.status(200).json({
        success: true,
        message: 'Brand deleted!'
    })
})

router.put('/:id', async (req,res)=>{


    const brand = await Brand.findByIdAndUpdate(
        req.params.id,
        {
            category:req.body.category,
            brand:req.body.brand,
        },
        {new:true}
    )

    if(!brand){
        return res.status(500).json({
            message:'brand cannot be updated',
            success:false
        })
    }

    res.send(brand);
})


module.exports = router;