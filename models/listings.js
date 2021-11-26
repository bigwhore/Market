const { number } = require('joi');
const mongoose = require('mongoose');
const { adventureSchema } = require('../schemas');
const review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const adventuresSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);


adventuresSchema.post('findOneAndDelete', async function (doc) {
    if(doc){
        await review.remove({
            _id: {
                $in: doc.reviews
            }
        })
    }
});



module.exports = mongoose.model('Adventure', adventuresSchema);
