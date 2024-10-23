const admin = require('../model/admin-model');
const Trip = require('../model/trip-model');
const Booking = require('../model/booking-model');
const sendMail = require('../services/email');
const jwt = require('jsonwebtoken');

const checkEmail = (email) =>{
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email);
}

const authAdmin = async (req, res, next) =>{
    
    const adminToken = req.header('Authorization');

    if(!adminToken) return next({message: 'Please login first'});

    const jwtToken = adminToken.replace('Bearer','').trim();
    try {
        const isVerified = jwt.verify(jwtToken, process.env.JWT_TOKEN);

        const adminData = await admin.findOne({_id: isVerified.adminID, email: isVerified.email}).select({password: 0});
        if(adminData){
            // console.log(userData);
            req.admin = adminData;
            req.token = jwtToken;
            req.adminID = adminData._id;
        }else{
            return next({message: 'You are not the admin! Go back to your work :)'});
        }
        next();
    } catch (error) {
        console.log('Error in auth-middelware:\n',error);
        return next({message: 'Unauthorized access'});
    }
    
    next();
}

const login = async (req, res, next) =>{
    try {        
        const {email, password} = req.body;

        if(!checkEmail(email)) return next({message: 'Please enter a valid email'});

        const adminExists = await admin.findOne({email});
        
        if(adminExists){
            if(await adminExists.verifyPass(password)){
                return res.status(200).json({
                    message: 'Login successfull',
                    token: adminExists.generateToken()
                });
            }else{
                return next({
                    status: 400,
                    message: 'Incorrect email or password'
                });
            }
        }else{
            return res.status(400).json({message: 'Incorrect email or password'});
        }        
    } catch (error) {
        console.log('Error in login auth-controller:\n', error);
    }
}

const acceptBooking = async (req, res, next) =>{
    try {
        const { bookingID } = req.params;

        // Fetch the booking based on the bookingID
        const booking = await Booking.findById(bookingID);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if(booking.isConfirmed){
            return res.status(200).json({message: 'Booking is already confirmed!'});
        }

        const trip = await Trip.findById(booking.tripID);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const availableSeats = trip.available; // Check if there are enough available seats for the booking
        const requestedSeats = booking.passengers.length;

        if (requestedSeats > availableSeats) {
            return res.status(400).json({ message: 'Not enough available seats for this booking' });
        }

        trip.available -= requestedSeats; // Deduct the number of requested seats from the trip's available seats
        await trip.save(); 

        booking.isConfirmed = true;
        await booking.save(); 

        // Send confirmation email to the user
        const email = booking.email;
        const title = "Your Trip Booking Has Been Confirmed!";
        let passengersList = booking.passengers.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.age}</td>
                <td>${p.gender}</td>
            </tr>`).join('');
        const message = `
            <html>
                <body>
                    <h2>Dear User,</h2>
                    <p>We are pleased to inform you that your booking for the trip to ${trip.location} has been confirmed.</p>
                    <p><strong>Trip Name:</strong> ${trip.tripname}</p>
                    <p><strong>From:</strong> ${trip.fromDate.toDateString()}</p>
                    <p><strong>To:</strong> ${trip.toDate.toDateString()}</p>
                    <p><strong>Number of Passengers:</strong> ${requestedSeats}</p>
                    <p>We look forward to welcoming you on this exciting journey!</p>
                    <p>Best regards, <br>Your Travel Team</p>
                </body>
            </html>
            <html>
                <body>
                    <h2>Dear ${booking.userID.username},</h2>
                    <p>Thank you for choosing us for your trip to ${trip.location}! Your booking request has been received and is being processed. Below are the details of your booking:</p>

                    <h3>Booking Details:</h3>
                    <p><strong>Booking ID:</strong> ${bookingID}</p>
                    <p><strong>Trip Name:</strong> ${trip.tripname}</p>
                    <p><strong>From Date:</strong> ${trip.fromDate.toDateString()}</p>
                    <p><strong>To Date:</strong> ${trip.toDate.toDateString()}</p>
                    <p><strong>Number of Passengers:</strong> ${requestedSeats}</p>
                    <p>For more details about your trip, you can visit the following link: <a href="google.com">Trip Information</a></p>

                    <h3>Passengers List:</h3>
                    <table border="1" cellpadding="10" cellspacing="0">
                        <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                        </tr>
                        ${passengersList}
                    </table>

                    <p>Best regards,<br>Travel Team</p>
                </body>
            </html>
        `;

        sendMail(email, title, message); // Call the sendMail function

        return res.status(200).json({
            message: 'Booking has been accepted and confirmed. Confirmation email sent to the customer.',
            bookingID: booking._id
        });

    } catch (error) {
        console.error('Error in acceptBooking:', error);
        return next({ message: 'An error occurred while accepting the booking' });
    }
}

const rejectBooking = async (req, res, next) => {
    try {
        const { bookingID } = req.params;
        const { reason } = req.body; // Reason for rejection from the request body

        const booking = await Booking.findById(bookingID).populate('userID');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const trip = await Trip.findById(booking.tripID);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Send rejection email to the user
        const email = booking.email;
        const title = "Your Trip Booking Has Been Rejected";
        let passengersList = booking.passengers.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.age}</td>
                <td>${p.gender}</td>
            </tr>`).join('');

        const message = `
            <html>
                <body>
                    <h2>Dear User,</h2>
                    <p>We regret to inform you that your booking for the trip to ${trip.location} has been rejected.</p>
                    <p><strong>Reason for Rejection:</strong> ${reason}</p>
                    <p><strong>Trip Name:</strong> ${trip.tripname}</p>
                    <p><strong>From:</strong> ${trip.fromDate.toDateString()}</p>
                    <p><strong>To:</strong> ${trip.toDate.toDateString()}</p>
                    <p><strong>Number of Passengers:</strong> ${booking.passengers.length}</p>

                    <h3>Passengers List:</h3>
                    <table border="1" cellpadding="10" cellspacing="0">
                        <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                        </tr>
                        ${passengersList}
                    </table>

                    <p>We apologize for the inconvenience caused. If you have any questions, feel free to contact our support team.</p>
                    <p>Best regards,<br>Your Travel Team</p>
                </body>
            </html>
        `;

        sendMail(email, title, message); // Call the sendMail function
        
        await Booking.findByIdAndDelete(bookingID); // Delete the booking from the database

        return res.status(200).json({
            message: 'Booking has been rejected and the booking entry has been removed.',
            bookingID: bookingID
        });

    } catch (error) {
        console.error('Error in rejectBooking:', error);
        return next({ message: 'An error occurred while rejecting the booking' });
    }
}

module.exports = {authAdmin, login, acceptBooking, rejectBooking};