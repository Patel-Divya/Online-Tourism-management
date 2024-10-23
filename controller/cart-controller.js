const {Cart, bookingDetails} = require('../model/cart-model');
const Trip = require('../model/trip-model');

const viewCart = async (req, res, next) => {
    
    try {
        const userID = req.user._id;  

        // Fetch the cart for the authenticated user, and populate the trip details
        const cart = await Cart.findOne({ userID })
            .populate({
                path: cart.tripID,   // Populating the tripID from the products collection
                model: Trip,         // The model name for 'Trip')
                select: 'tripName location fromDate toDate price available image'  // Select specific fields
            });

        if (!cart) {
            return res.status(404).json({ message: 'Cart is empty' });
        }

        res.json({data:'none'});
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error });
        console.log(error);
        
    }
}

const saveBook = async (req, res, next) => {
    try {
        const tripID = req.params.id;
        const userID = req.userID;
        const { passengers } = req.body;

        if (!tripID || !userID) {
            return res.status(400).json({ message: 'Trip ID and User ID are required.' });
        }

        let savedBooking = await bookingDetails.findOne({ tripID, userID });

        if (savedBooking) {
            savedBooking.passengers = passengers || savedBooking.passengers; // Update passengers if provided
            await savedBooking.save();
            next();
        } else {
            savedBooking = new bookingDetails({
                tripID,
                userID,
                passengers: passengers || []
            });
            await savedBooking.save();
            next();
        }
    } catch (error) {
        console.error('Error in saveBook:', error);
        return next({ message: 'An error occurred while saving the booking information.' });
    }
}

const getSavedBook = async (req, res, next) => {
    try {
        const tripID = req.params.id;
        const userID = req.userID;

        const savedBooking = await bookingDetails.findOne({ tripID, userID });

        if (!savedBooking) {
            console.log(1);
            req.meg = 'No saved booking found for this trip.';
            req.status = 404;
            req.err = true;

            return next();
        }
        req.err = false;
        req.passengers= savedBooking.passengers ;
        return next();
    } catch (error) {
        console.log(`Error in getSavedBooking: ${error}`);
        console.log(3);
        req.meg = 'An error occurred while fetching your booking information.';
        req.err = true;
        return next();
        // return next({message: 'An error occurred while fetching your booking information.' });  // Handle any errors
    }
}

module.exports = {viewCart, saveBook, getSavedBook};