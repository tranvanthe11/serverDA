const mongoose = require('mongoose');

const ordersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentId: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    products:[
        {
            productTitle: {
                type: String
            },
            productId: {
                type: String
            },
            quantity: {
                type: Number
            },
            price: {
                type: Number
            },
            images: {
                type: String
            },
            subTotal: {
                type: Number
            },
            size:{
                type:String
            },
            color:{
                type:String
            },
        }
    ],
    status:{
        type:String,
        default:"pending"
    },
    date:{
        type:Date,
        default: () => new Date(Date.now() + 7 * 60 * 60 * 1000)
    }

},
{ 
    timestamps: true 
});

ordersSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

ordersSchema.set('toJSON' , {
    virtuals: true,
})

exports.Orders = mongoose.model('Orders', ordersSchema);
exports.ordersSchema = ordersSchema;