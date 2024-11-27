const { Orders } = require('../models//orders');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {

    try{
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        const totalPosts = await Orders.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
        if (page > totalPages) {
            return res.status(404).json({ message: "Page not found"})
        }
    
        const ordersList = await Orders.find(req.query)
            .sort({ createdAt: -1 })
            .skip((page -1) * perPage)
            .limit(perPage)
            .exec();
    
        if(!ordersList) {
            return res.status(500).json({ success: false})
        }
        
        return res.status(200).json({
            "ordersList":ordersList,
            "totalPages":totalPages,
            "page":page
        })

    }catch(error){
        return res.status(500).json({ success: false})
    }

})

router.get('/:id', async (req, res) => {
    const orders = await Orders.findById(req.params.id);

    if(!orders) {
        return res.status(500).json({ message: 'The orders with the given id was not found.'})
    }
    
    return res.status(200).send(orders);
})

router.delete('/:id', async (req, res) => {


    const deleteOrder = await Orders.findByIdAndDelete(req.params.id);

    if(!deleteOrder){
        return res.status(404).json({
            message: 'Orders not find',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Order deleted!'
    })
})


router.post('/create', async (req, res) => {

    let order = new Orders({
        name:req.body.name,
        phone:req.body.phone,
        address:req.body.address,
        amount:req.body.amount,
        paymentId:req.body.paymentId,
        email:req.body.email,
        userId:req.body.userId,
        products:req.body.products,
    })
    
    if(!order){
        return res.status(500).json({
            error: err,
            success: false
        })
    }
    order = await order.save();

    return res.status(201).json(order);

})

router.put('/:id', async (req,res)=>{


    const order = await Orders.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            phone:req.body.phone,
            address:req.body.address,
            amount:req.body.amount,
            paymentId:req.body.paymentId,
            email:req.body.email,
            userId:req.body.userId,
            products:req.body.products,
            status:req.body.status,
        },
        {new:true}
    )

    if(!order){
        return res.status(500).json({
            message:'order cannot be updated',
            success:false
        })
    }


    return res.send(order);
})

module.exports = router;