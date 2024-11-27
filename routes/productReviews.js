const express = require('express');
const router = express.Router();
const {ProductReviews} = require('../models/productReviews');

router.get('/', async (req, res) => {
    let reviews=[];
    try{
        if(req.query.productId!==undefined && req.query.productId!==null && req.query.productId!==""){
            reviews = await ProductReviews.find({productId: req.query.productId}).sort({ createdAt: -1 });
        }else{
            reviews = await ProductReviews.find().sort({ createdAt: -1 });
        }

        if(!reviews){
            return res.status(500).json({success: false})
        }
        return res.status(200).json(reviews);
    }catch(error){
        return res.status(500).json({ success: false})
    }
})

router.get('/:id', async (req, res) => {
    const review = await ProductReviews.find(req.query.id);

    if(!review) {
        return res.status(500).json({ message: 'The review with the given id was not found.'})
    }
    
    return res.status(200).send(review);
})

router.post('/add', async (req, res) => {

    let review = new ProductReviews({
        productId:req.body.productId,
        customerName:req.body.customerName,
        customerId:req.body.customerId,
        review:req.body.review,
        customerRating:req.body.customerRating,
    })
    
    if(!review){
        return res.status(500).json({
            error: err,
            success: false
        })
    }
    
    review = await review.save();
    
    return res.status(201).json(review);
    
    
})

router.delete('/:id', async (req, res) => {
    
    const deleteBrand = await Brand.findByIdAndDelete(req.params.id);

    if(!deleteBrand){
        return res.status(404).json({
            message: 'Brand not find',
            success: false
        })
    }

     return res.status(200).json({
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

    return res.send(brand);
})


module.exports = router;