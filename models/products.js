const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    // brand:{
    //     type:String,
    //     default: ''
    // },
    price:{
        type:Number,
        default: 0
    },
    discount:{
        type:Number,
        default: 0
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    brand:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required:true
    },
    countInStock:{
        type:Number,
        default: 0
    },
    rating:{
        type:Number,
        default: 0
    },
    numReviews:{
        type:Number,
        default: 0
    },
    isNewProduct:{
        type:Boolean,
        default: false
    },
    images:[
        {
            type: String,
            required: true
        }
    ],
    productSize:[
        {
            type: String,
            default:null
            // required: true
        }
    ],
    productColor:[
        {
            type: String,
            default:null

            // required: true
        }
    ],
    dateCreated:{
        type:Date,
        default: Date.now
    }
})

productSchema.virtual('oldPrice').get(function () {
    if (this.discount > 0) {
        return Math.round((this.price * 100) / (100-this.discount));
    }
    return this.price;
});

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

productSchema.set('toJSON' , {
    virtuals: true,
})


exports.Product = mongoose.model('Product', productSchema);
exports.productSchema = productSchema;