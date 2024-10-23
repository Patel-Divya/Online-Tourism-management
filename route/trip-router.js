const express = require('express');
const router = express.Router();
const tripController = require('../controller/trip-controller');
const authMiddleware = require('../middleware/auth-middleware');

router.route('/:location').get(tripController.showTrips);
router.route('/info/:id').get(tripController.getTripInffo);

router.route('/book/:id').post(authMiddleware, tripController.bookTrip, (req, res)=>{
    return res.status(200).json({
        message: 'Booking request sent! \n We will contact you to confirm your booking and payment.',
        success: true
    });    
});

module.exports = router;