const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const cartController = require('../controller/cart-controller');

router.route('/add/:id').put(authMiddleware);
router.route('/view').get(authMiddleware, cartController.viewCart);
router.route('/delete/:id').delete(authMiddleware);

router.route('/book/save/:id').post(authMiddleware, cartController.saveBook, (req, res)=>{
    return res.status(200).json({
        message: 'Booking information updated successfully.',
        success: true
    });
});

// router.route('/get/book/save/:id').get(authMiddleware, cartController.getSavedBook);


router.route('/get/book/save/:id').get(authMiddleware, cartController.getSavedBook, async (req, res, next)=>{
    console.log('message:',req.msg );
    console.log('err:',req.err );
    console.log('passengers:',req.passengers );
    console.log('status:',req.status );
    if(req.err){
        if(req.status) return next({status: req.status, message: req.msg});
        else return next({message: req.msg});
    }else{
        return res.status(200).json({
            message: req.msg,
            success: true
        });
    }
}
);

module.exports = router;