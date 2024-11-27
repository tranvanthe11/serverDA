const { MyList } = require('../models/myList');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {

    try{
    
        const myList = await MyList.find(req.query).sort({ createdAt: -1 });;
        if(!myList) {
            return res.status(500).json({ success: false})
        }
        
        return res.status(200).json(myList);

    }catch(error){
        return res.status(500).json({ success: false})
    }

})

router.delete('/:id', async (req, res) => {

    const item = await MyList.findById(req.params.id);

    if(!item){
        return res.status(404).json({msg:'The item given id is not found'})
    }

    const deleteItem = await MyList.findByIdAndDelete(req.params.id);

    if(!deleteItem){
        return res.status(404).json({
            message: 'Item not find',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'item deleted!'
    })
})


router.post('/add', async (req, res) => {

    const item = await MyList.find({ productId: req.body.productId, userId: req.body.userId});
    if(item.length === 0){
        let list = new MyList({
            productTitle:req.body.productTitle,
            images:req.body.images,
            price:req.body.price,
            productId:req.body.productId,
            userId:req.body.userId,
        })
        
        if(!list){
            return res.status(500).json({
                error: err,
                success: false
            })
        }
        list = await list.save();
    
        return res.status(201).json(list);
    }else{
        return res.status(401).json({status:false, msg:"Sản phẩm đã có trong danh sách ưa thích"})
    }
})


module.exports = router;