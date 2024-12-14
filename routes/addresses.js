const express = require('express');
const {Address} = require('../models/addresses');
const router = express.Router();

router.get('/', async (req, res) => {
  const { userId } = req.query;

  if (!userId) return res.status(400).json({ message: 'UserId is required' });

  try {
    const addresses = await Address.find({ userId }).sort({ isDefault: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses', error });
  }
});

router.post('/add', async (req, res) => {
    const { userId, isDefault, name, phone, address, province, district, ward , street} = req.body;
  
    try {
      // Nếu người dùng chọn địa chỉ mặc định, cập nhật tất cả các địa chỉ khác thành không phải mặc định
      if (isDefault) {
        await Address.updateMany({ userId }, { $set: { isDefault: false } });
      }
  
      // Tạo mới một địa chỉ
      let addressList = new Address({
        name,
        phone,
        address,
        province,
        district,
        ward,
        street,
        isDefault,
        userId,
      });
  
      // Lưu địa chỉ vào cơ sở dữ liệu
      addressList = await addressList.save();
  
      return res.status(201).json(addressList);
    } catch (error) {
      return res.status(500).json({
        message: 'Error adding address',
        error: error.message,
      });
    }
  });

  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { userId, name, phone, address, province, district, ward, street, isDefault } = req.body;
  
    try {
      // Nếu địa chỉ mới được chọn làm mặc định, cập nhật tất cả các địa chỉ khác thành không phải mặc định
      if (isDefault) {
        await Address.updateMany({ userId }, { $set: { isDefault: false } });
      }
  
      // Cập nhật địa chỉ
      const updatedAddress = await Address.findByIdAndUpdate(
        id,
        { name, phone, address, province, district, ward,street, isDefault },
        { new: true }
      );
  
      // Nếu không tìm thấy địa chỉ cần cập nhật
      if (!updatedAddress) return res.status(404).json({ message: 'Address not found' });
  
      // Trả về địa chỉ đã cập nhật
      res.json(updatedAddress);
    } catch (error) {
      res.status(500).json({ message: 'Error updating address', error });
    }
  });

  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedAddress = await Address.findByIdAndDelete(id);
  
      if (!deletedAddress) return res.status(404).json({ message: 'Address not found' });
  
      res.json({ message: 'Address deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting address', error });
    }
  });


module.exports = router;