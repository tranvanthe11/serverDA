const mongoose = require('mongoose');

const brandSchema = mongoose.Schema({
    category:{
        // type: String,
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    brand:{
        type: String,
        required:true
    },
},
{ 
    timestamps: true 
})

brandSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

brandSchema.set('toJSON' , {
    virtuals: true,
})

exports.Brand = mongoose.model('Brand', brandSchema);
exports.brandSchema = brandSchema;