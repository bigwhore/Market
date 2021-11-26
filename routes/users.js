const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const { nextTick } = require('process');
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const { route } = require('..');
const Adventure = require('../models/listings');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureRedirect: '/login'}), users.login);


router.get('/logout', users.logout);

module.exports = router;