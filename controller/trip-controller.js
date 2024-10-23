const Trip = require('../model/trip-model');
const Bookings = require('../model/booking-model');
const {bookingDetails} = require('../model/cart-model');
const sendMail = require('../services/email');

const showTrips = async (req, res, next) => {
    try {
        const location = req.params.location;

        const trips = await Trip.find({location},'tripname location fromDate toDate price available image _id');

        if (trips.length > 0) {
            const trips_list = trips.map(trip => ({
                tripCode: trip._id,
                title: trip.tripname,
                location: trip.location,
                fromDate: trip.fromDate,
                toDate: trip.toDate,
                price: trip.price,
                available: trip.available,
                image: trip.image[0]
            }));
            return res.status(200).json(trips_list);
        } else {
            return next({status:400, message: 'No trips found for this location'});
        }
    } catch (error) {
        next({message: 'An error occured!'});
        console.log('Error in showTrips: ', error);
    }
};

const getTripInffo = async (req, res, next) => {
    try {
        const id = req.params.id;

        const trip = await Trip.findOne({_id:id});
        
        if (trip) {
            const { _id: tripCode, ...tripData } = trip.toObject(); // Convert to plain JS object and destructure
            const tripInfo = { tripCode, ...tripData };
            return res.status(200).json(tripInfo);
        } else {
            return next({status:400, message: 'Trip not found!'});
        }
    } catch (error) {
        next({message: 'An error occured!'});
        console.log('Error in getTripInffo: ', error);
    }
}

const bookTrip = async (req, res, next) => {
    try {
        const tripID  = req.params.id; 
        const { passengers } = req.body; 
        const userID = req.userID;        
        const { email, phone, username } = req.user; 
        console.log(email, phone, username, userID, passengers, tripID);
        

        if (!tripID || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
            return next({ status: 400, message: 'Invalid trip or passengers data' });
        }

        const tripExists = await Trip.findById(tripID);
        if (!tripExists) {
            return next({ status: 400, message: 'Trip not found' });
        }

        const availableSeats = tripExists.available;
        if (availableSeats <= passengers.length) {
            return next({ status: 400, message: 'Seats are not available for the requested number of passengers' });
        }
        

        const newBooking = new Bookings({
            tripID,
            userID,
            passengers,
            email,
            phone
        });
        
        const savedBooking = await newBooking.save();
        await bookingDetails.deleteOne({ tripID, userID });

        const tripname = tripExists.tripname;
        const location = tripExists.location;
        const bookingID = savedBooking._id;
        const fromDate = tripExists.fromDate.toDateString();
        const toDate = tripExists.toDate.toDateString();
        const url = `https://6hz6c9fr-5501.inc1.devtunnels.ms/kerala/trip-info/goa-tour.html?id=${tripID}`; // chenge url

        let passengersList = passengers.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.age}</td>
                <td>${p.gender}</td>
            </tr>`).join('');

        const title = "Booking Request for Your Trip!";
        const message = `
            <html>
                <body>
                    <h2>Dear ${username},</h2>
                    <p>Thank you for choosing us for your trip to ${location}! Your booking request has been received and is being processed. Below are the details of your booking:</p>

                    <h3>Booking Details:</h3>
                    <p><strong>Booking ID:</strong> ${bookingID}</p>
                    <p><strong>Trip Name:</strong> ${tripname}</p>
                    <p><strong>Location:</strong> ${location}</p>
                    <p><strong>From Date:</strong> ${fromDate}</p>
                    <p><strong>To Date:</strong> ${toDate}</p>
                    <p>For more details about your trip, you can visit the following link: <a href="${url}">Trip Information</a></p>

                    <h3>Passengers List:</h3>
                    <table border="1" cellpadding="10" cellspacing="0">
                        <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                        </tr>
                        ${passengersList}
                    </table>

                    <p>We will contact you shortly to confirm your booking and guide you through the payment process. In the meantime, if you have any questions, feel free to reach out to our support team.</p>

                    <p>Best regards,<br>Your Travel Team</p>
                </body>
            </html>
        `;
        sendMail(email, title, message);

        return next();
    } catch (error) {
        console.error('Error in bookTrip:', error);
        return next({ message: 'An error occurred while booking the trip' });
    }
}

module.exports = {showTrips, getTripInffo, bookTrip};