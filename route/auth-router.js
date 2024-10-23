const express = require('express');
const router = express.Router();
const authController = require('../controller/auth-controller');
const validate = require('../middleware/auth-validate-midddleware');
const {signupSchema, loginSchema, emailSchema} = require('../validators/auth-validator');
const authUser = require('../middleware/auth-middleware');


const passport = require('passport');
require('../services/passport');

router.use(passport.initialize());
router.use(passport.session());

router.route('/google').get(
    passport.authenticate('google', {failureRedirect: 'google.com'}),
    authController.googleLogin
);

router.route('/register').post(validate(signupSchema), authController.signup);
router.route('/login').post(validate(loginSchema), authController.login);
router.route('/user').get(authUser, authController.user);

router.route('/pass/reset').post( validate(emailSchema), (req, res,next)=>{
    req.body.for='password_reset';
    authController.resetPass(req, res,next);
}); 

router.route('/pass/change').post((req, res,next)=>{
    req.body.for='password_reset';
    authController.changePass(req, res,next);
}); 

module.exports = router;