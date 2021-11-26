const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const reviews = require('../routes/reviews');
const Adventure = require('../models/listings');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas.js');
const review = require('../controllers/reviews');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Review = require('../models/review');
const app = express();
const path = require('path');


router.post('/', validateReview, catchAsync(review.createReview));

router.delete('/:reviewid', catchAsync(review.deleteReview));

module.exports = router;