const User = require('../models/user');
const Adventure = require('../models/listings');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const jwt_key = process.env.JWT_KEY;

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
};

module.exports.register = async (req, res, next) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome');
            res.redirect('/adventures')
        })
    } catch (e) {
        res.redirect('register');
  }
        console.log(registeredUser);
};


module.exports.renderLogin = (req, res) => {
    res.render('users/login')
};

module.exports.login = (req, res) => {
    const redirectUrl = req.session.returnTo || '/adventures';
    const user = User;
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwt_key,
        {
          expiresIn: '1h'
        }
      );
    delete req.session.returnTo;
    res.redirect(redirectUrl);
    return { userId: user.id, token: token, tokenExpiration: 1 };
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye");
    res.redirect('/adventures');
};

