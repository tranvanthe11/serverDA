const mongoose = require('mongoose');

const productSizeSchema = mongoose.Schema({
    productSize:{
        type: String,
        default: null
    }
},
{ 
    timestamps: true 
})

productSizeSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

productSizeSchema.set('toJSON' , {
    virtuals: true,
})

exports.ProductSize = mongoose.model('ProductSize', productSizeSchema);
exports.productSizeSchema = productSizeSchema;