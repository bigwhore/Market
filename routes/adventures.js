const adventures = require('../controllers/adventures');

const express = require('express');
const router = express.Router();
const { isLoggedIn, validateAdventure } = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const { adventureSchema, reviewSchema } = require('../schemas.js');
const Review = require('../models/review');
const flash = require('connect-flash');

const { storage } = require('../cloudinary');
const Adventure = require('../models/listings');
const ExpressError = require('../utils/ExpressError');
const Joi = require('joi');
const app = express();
const multer = require('multer');
const upload = multer({ storage });
const path = require('path');


router.route('/')
    .get(catchAsync(adventures.index))
    .post(isLoggedIn, upload.array('image'), validateAdventure, catchAsync(adventures.createAdventure));

router.get('/new', isLoggedIn, adventures.renderNewForm);
    
router.get('/admin', catchAsync(adventures.admin), catchAsync(adventures.index));

router.route('/:id')
    .get(catchAsync(adventures.showAdventure), catchAsync(adventures.index))
    .put(validateAdventure, catchAsync(adventures.updateAdventure))
    .delete(catchAsync(adventures.deleteAdventure));


router.get('/:id/edit', catchAsync(adventures.renderEditForm));











module.exports = router;