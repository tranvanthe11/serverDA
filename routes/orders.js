const { Orders } = require('../models//orders');
const { Product } = require('../models/products');
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
    const { products } = req.body;

    for (const item of products) {
        const product = await Product.findById(item.productId);

        if (!product) {
            return res.status(404).json({ message: `Product ${item.productId} not found` });
        }

        const sizeColorStock = product.sizesAndColors.find(
            (sc) => sc.size === item.size && sc.color === item.color
        );

        if (!sizeColorStock || sizeColorStock.countInStock < item.quantity) {
            return res.status(400).json({
                message: `Not enough stock for product ${item.productTitle} (${item.size} - ${item.color})`,
            });
        }

        sizeColorStock.countInStock -= item.quantity;
        product.sold += item.quantity;

        if (sizeColorStock.isPromotion) {
            sizeColorStock.quantitySold += item.quantity;

            // Nếu đã bán hết số lượng khuyến mãi, tự động hủy khuyến mãi
            if (sizeColorStock.quantitySold >= sizeColorStock.promotionQuantity) {
                sizeColorStock.isPromotion = false;
                sizeColorStock.promotionDiscount = 0;
                sizeColorStock.pricePromotion = 0;
                sizeColorStock.promotionQuantity = 0;
                sizeColorStock.quantitySold = 0;
            }
        }
        await product.save();
    }

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

const updateStockOnStatusChange = async (products) => {
    for (const item of products) {
        const product = await Product.findById(item.productId);

        if (!product) {
            throw new Error(`Product ${item.productId} not found`);
        }

        const sizeColorStock = product.sizesAndColors.find(
            (sc) => sc.size === item.size && sc.color === item.color
        );

        if (sizeColorStock) {
            sizeColorStock.countInStock += item.quantity;
            product.sold -= item.quantity;
            await product.save();
        }
    }
};

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

    if (['cancel', 'refund'].includes(order.status)) {
        await updateStockOnStatusChange(order.products);
    }


    return res.send(order);
})
router.get('/revenue-and-profit', async (req, res) => {
    try {
        // Lấy danh sách đơn hàng đã hoàn thành
        const completedOrders = await Orders.find({ status: 'done' });
        console.log(completedOrders)

        // Tính tổng doanh thu (revenue)
        const revenue = completedOrders.reduce((total, order) => total + order.amount, 0);

        // Tính tổng giá vốn hàng bán (COGS)
        let totalCost = 0;
        for (const order of completedOrders) {
            for (const product of order.products) {
                const productDetails = await Product.findById(product.productId); // Tìm sản phẩm
                if (productDetails) {
                    const cost = productDetails.costPrice * product.quantity; // Giá vốn = Giá gốc * Số lượng
                    totalCost += cost;
                }
            }
        }

        // Tính lợi nhuận (profit)
        const profit = revenue - totalCost;

        return res.status(200).json({
            revenue,
            profit,
            totalCost,
        });
    } catch (error) {
        console.error("Error calculating revenue and profit:", error);
        return res.status(500).json({ success: false, message: "Failed to calculate revenue and profit." });
    }
});

module.exports = router;