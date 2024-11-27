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
    price:{
        type:Number,
        default: 0
    },
    discount:{
        type:Number,
        default: 0
    },
    catName:{
        type:String,
        default:''
    },
    catId:{
        type:String,
        default:''
    },
    brandName:{
        type:String,
        default:''
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
    sizesAndColors: [
        {
            size: {
                type: String,
                required: true
            },
            color: {
                type: String,
                required: true
            },
            countInStock: {
                type: Number,
                default: 0
            }
        }
    ],
    dateCreated:{
        type:Date,
        default: Date.now
    },
    sold: {
        type: Number, 
        default: 0  
    },
},
{ 
    timestamps: true 
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