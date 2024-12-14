const mongoose = require('mongoose');

const leftBannerSchema = mongoose.Schema({
    images: [
        {
            type: String,
            required: true,
        },
    ],
},
{ 
    timestamps: true 
});

leftBannerSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

leftBannerSchema.set('toJSON' , {
    virtuals: true,
})

exports.LeftBanner = mongoose.model('LeftBanner', leftBannerSchema);
exports.leftBannerSchema = leftBannerSchema;