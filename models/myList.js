const mongoose = require('mongoose');

const myListSchema = mongoose.Schema({
    productTitle: {
        type: String,
        required: true,
    },
    images:{
        type: String,
        required: true,
    },
    price: {
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
});

myListSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

myListSchema.set('toJSON' , {
    virtuals: true,
})

exports.MyList = mongoose.model('MyList', myListSchema);
exports.myListSchema = myListSchema;