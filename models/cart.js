const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    productTitle: {
        type: String,
        required: true,
    },
    catName: {
        type: String,
        required: true,
    },
    images:{
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    subTotal: {
        type: Number,
        required: true,
    },
    productId:{
        type: String,
        required: true
    },
    userId:{
        type: String,
        required: true
    }
},
{ 
    timestamps: true 
}
);


cartSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

cartSchema.set('toJSON' , {
    virtuals: true,
})

exports.Cart = mongoose.model('Cart', cartSchema);
exports.cartSchema = cartSchema;