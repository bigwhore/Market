const Adventure = require('../models/listings');
const Review = require('../models/review');
const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');


module.exports.createReview = async(req, res) => {
    const adventure = await Adventure.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    adventure.reviews.push(review);
    await review.save();
    await adventure.save();
    req.flash('success', 'Review posted!');
    res.redirect(`/adventures/${adventure._id}`);
};

module.exports.deleteReview = async(req, res) => {
    const { id, reviewId } = req.params;
    await Adventure.findByIdAndUpdate(id, { $pull: { reviews: reviewId} });
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully deleted review'); 
    res.redirect(`/adventures/${id}`);
};