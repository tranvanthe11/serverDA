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

router.get('/by-category', async (req, res) => {
    try {
        const { year, month, week } = req.query;

        if (!year) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp năm để thống kê." });
        }

        const filter = {
            status: 'done',
            date: {
                $gte: moment(year, 'YYYY').startOf('year').toDate(),
                $lte: moment(year, 'YYYY').endOf('year').toDate()
            }
        };

        if (month) {
            filter.date.$gte = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
            filter.date.$lte = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').toDate();
        }

        if (week) {
            const startOfWeek = moment().year(year).week(week).startOf('week').toDate();
            const endOfWeek = moment().year(year).week(week).endOf('week').toDate();
            filter.date.$gte = startOfWeek;
            filter.date.$lte = endOfWeek;
        }

        // Lấy danh sách đơn hàng hoàn thành theo điều kiện lọc
        const completedOrders = await Orders.find(filter);

        // Tạo bản đồ thống kê theo tháng, tuần và loại sản phẩm
        const groupedData = {};

        for (const order of completedOrders) {
            for (const product of order.products) {
                const category = product.catName || 'Unknown';
                const month = moment(order.date).format('MMMM'); // Lấy tên tháng
                const week = `Week ${moment(order.date).week()}`; // Lấy số tuần

                // Khởi tạo dữ liệu nếu chưa tồn tại
                if (!groupedData[category]) groupedData[category] = {};
                if (!groupedData[category][month]) groupedData[category][month] = {};
                if (!groupedData[category][month][week]) {
                    groupedData[category][month][week] = { revenue: 0, totalCost: 0, totalSold: 0 };
                }

                const productDetails = await Product.findById(product.productId);

                if (productDetails) {
                    // Cộng dồn dữ liệu
                    const weekData = groupedData[category][month][week];
                    weekData.revenue += product.subTotal;
                    weekData.totalCost += productDetails.costPrice * product.quantity; // Sửa đây
                    weekData.totalSold += product.quantity;
                }
            }
        }

        // Chuyển dữ liệu thành định dạng dễ đọc
        const result = Object.keys(groupedData).map(category => {
            const months = Object.keys(groupedData[category]).map(month => {
                const weeks = Object.keys(groupedData[category][month]).map(week => {
                    const data = groupedData[category][month][week];
                    return {
                        week,
                        revenue: data.revenue,
                        totalCost: data.totalCost,
                        profit: data.revenue - data.totalCost,
                        totalSold: data.totalSold,
                    };
                });

                return {
                    month,
                    weeks,
                };
            });

            return {
                category,
                months,
            };
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error("Lỗi khi tính toán thống kê chi tiết:", error);
        return res.status(500).json({ success: false, message: "Thống kê chi tiết thất bại." });
    }
});


module.exports = router;
