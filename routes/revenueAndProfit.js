const { Orders } = require('../models/orders');
const { Product } = require('../models/products');
const express = require('express');
const router = express.Router();
const moment = require('moment');

router.get('/', async (req, res) => {
    try {
        const { year } = req.query;

        if (!year) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp năm để thống kê." });
        }

        const completedOrders = await Orders.find({ 
            status: 'done', 
            date: { 
                $gte: moment(year, 'YYYY').startOf('year').toDate(), 
                $lte: moment(year, 'YYYY').endOf('year').toDate() 
            } 
        });

        // Tạo bản đồ doanh thu và chi phí theo từng tháng
        const groupedData = {};

        for (const order of completedOrders) {
            const month = moment(order.date).format('MMMM');
            if (!groupedData[month]) {
                groupedData[month] = { revenue: 0, totalCost: 0 };
            }

            groupedData[month].revenue += order.amount;

            for (const product of order.products) {
                const productDetails = await Product.findById(product.productId);
                if (productDetails) {
                    const cost = productDetails.costPrice * product.quantity;
                    groupedData[month].totalCost += cost;
                }
            }
        }

        const profitData = Object.keys(groupedData).map(month => {
            const data = groupedData[month];
            return {
                month, 
                revenue: data.revenue,
                totalCost: data.totalCost,
                profit: data.revenue - data.totalCost,
            };
        });

        const months = moment.months();
        const result = months.map(month => {
            const found = profitData.find(data => data.month === month);
            return found || { month, revenue: 0, totalCost: 0, profit: 0 };
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error("Lỗi khi tính toán doanh thu và lợi nhuận:", error);
        return res.status(500).json({ success: false, message: "Tính toán doanh thu và lợi nhuận thất bại." });
    }
});

module.exports = router;
