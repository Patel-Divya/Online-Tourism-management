const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin-controller');
const validate = require('../middleware/auth-validate-midddleware');
const {loginSchema} = require('../validators/auth-validator');

router.route('/login').post(validate(loginSchema), adminController.login);
router.route('/accept/:bookingID').post(adminController.authAdmin, adminController.acceptBooking);
router.route('/reject/:bookingID').post(adminController.authAdmin, adminController.rejectBooking);

module.exports = router;