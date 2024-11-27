const { Cart } = require('../models/cart');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {

    try{
    
        const cartList = await Cart.find(req.query).sort({ createdAt: -1 });;
        if(!cartList) {
            return res.status(500).json({ success: false})
        }
        
        return res.status(200).json(cartList);

    }catch(error){
        return res.status(500).json({ success: false})
    }

})

router.delete('/:id', async (req, res) => {

    const cartItem = await Cart.findById(req.params.id);

    if(!cartItem){
        return res.status(404).json({msg:'The cart item given id is not found'})
    }

    const deleteItem = await Cart.findByIdAndDelete(req.params.id);

    if(!deleteItem){
        return res.status(404).json({
            message: 'Item not find',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Cart item deleted!'
    })
})

router.delete('/clear/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const result = await Cart.deleteMany({ userId: userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No items found in the cart for the given user ID",
            });
        }
        return res.status(200).json({
            success: true,
            message: "All cart items for the user have been deleted!",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while clearing the cart",
        });
    }
});

router.post('/add', async (req, res) => {

    const cartItem = await Cart.find({ productId: req.body.productId,  userId: req.body.userId});
    if(cartItem.length === 0){
        let cartList = new Cart({
            productTitle:req.body.productTitle,
            images:req.body.images,
            color:req.body.color,
            size:req.body.size,
            price:req.body.price,
            quantity:req.body.quantity,
            subTotal:req.body.subTotal,
            productId:req.body.productId,
            userId:req.body.userId,
        })
        
        if(!cartList){
            return res.status(500).json({
                error: err,
                success: false
            })
        }
        cartList = await cartList.save();
    
        return res.status(201).json(cartList);
    }else{
        return res.status(401).json({status:false, msg:"Sản phẩm đã có trong giỏ hàng"})
    }
})

router.put('/:id', async (req,res)=>{


    const cartList = await Cart.findByIdAndUpdate(
        req.params.id,
        {
            productTitle:req.body.productTitle,
            images:req.body.images,
            color:req.body.color,
            size:req.body.size,
            price:req.body.price,
            quantity:req.body.quantity,
            subTotal:req.body.subTotal,
            productId:req.body.productId,
            userId:req.body.userId,
        },
        {new:true}
    )

    if(!cartList){
        return res.status(500).json({
            message:'cart item cannot be updated',
            success:false
        })
    }

    return res.send(cartList);
})
router.get(`/count`, async (req, res) => {
    const cartItemsCount = await Cart.countDocuments((count) => count)
    if(!cartItemsCount){
        return res.status(500).json({success: false})
    }
    return res.send({
        cartItemsCount: cartItemsCount
    })
})

module.exports = router;