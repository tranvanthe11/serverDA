const {ProductSize} = require("../models/productSize");
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try{
        const productSizeList = await ProductSize.find();
        if(!productSizeList){
            return res.status(500).json({success: false})
        }
        return res.status(200).json(productSizeList);
    }catch(error){
        return res.status(500).json({ success: false})
    }
})

router.get('/:id', async (req, res) => {
    const item = await ProductSize.findById(req.params.id);

    if(!item) {
        return res.status(500).json({ message: 'The item with the given id was not found.'})
    }
    
    return res.status(200).send(item);
})


router.post('/create', async (req, res) => {

    let productSize = new ProductSize({
        productSize:req.body.productSize,
    })
    
    if(!productSize){
        return res.status(500).json({
            error: err,
            success: false
        })
    }
    productSize = await productSize.save();

    return res.status(201).json(productSize);
})

router.delete('/:id', async (req, res) => {

    const deleteItem = await ProductSize.findByIdAndDelete(req.params.id);

    if(!deleteItem){
        return res.status(404).json({
            message: 'Item not find',
            success: false
        })
    }

     return res.status(200).json({
        success: true,
        message: 'Item deleted!'
    })
})

router.put('/:id', async (req,res)=>{


    const item = await ProductSize.findByIdAndUpdate(
        req.params.id,
        {
            productSize:req.body.productSize,
        },
        {new:true}
    )

    if(!item){
        return res.status(500).json({
            message:'item cannot be updated',
            success:false
        })
    }

    return res.send(item);
})

module.exports = router;
