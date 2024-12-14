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
    costPrice: {
        type: Number,
        default: 0,
    },
    price:{
        type:Number,
        default: 0
    },
    oldPrice:{
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
            },
            dateStockIn: {
                type: Date,
                default: () => new Date(Date.now() + 7 * 60 * 60 * 1000)
            },
            isPromotion: {
                type: Boolean,
                default: false,
            },
            promotionDiscount: {
                type: Number,
                default: 0,
            },
            pricePromotion: {
                type: Number,
                default: 0,
            },
            promotionQuantity: {
                type: Number,
                default: 0,
            },
            quantitySold: {
                type: Number,
                default: 0,
            },
        }
    ],
    dateCreated:{
        type:Date,
        default: () => new Date(Date.now() + 7 * 60 * 60 * 1000)
    },
    sold: {
        type: Number, 
        default: 0  
    },
},
{ 
    timestamps: true 
})

productSchema.virtual('discount').get(function () {
        return Math.round((1 - this.price/this.oldPrice)*100);
});

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

productSchema.set('toJSON' , {
    virtuals: true,
})


exports.Product = mongoose.model('Product', productSchema);
exports.productSchema = productSchema;