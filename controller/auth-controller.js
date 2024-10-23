const {User, passReset} = require('../model/customer-model');
const sendMAil = require('../services/email');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateRandom = async () => {
    return crypto.randomBytes(32).toString('hex'); //generate random session string
}

const signup = async (req, res, next) => {
    try {
        const {username, email, phone, password, countryCode} = req.body;

        if(!checkUsername(username)) return next({message: 'Username must contain only alphabets'});
        else if(!checkEmail(email)) return next({message: 'Please enter a valid email'});
        else if(!checkPass(password)) return next({message: 'Password must contain atleast one Alphanumeric and special charectors'});

        else{
            const emailExists = await User.findOne({email});
            const phoneExists = await User.findOne({phone});
            // console.log(emailExists, phoneExists);

            if(!emailExists && !phoneExists){
                const userCreated = await User.create({
                    username, email, phone, password, countryCode
                });
                // console.log('User created:', userCreated);

                const message = `<p>Dear ${username},<br><br>
                Welcome to Dream Trip! We're thrilled to have you on board.<br><br>
                Your account has been successfully created with the following details:<br>
                <strong>Email:</strong> ${email}<br>
                <strong>Phone:</strong> ${countryCode}${phone}<br><br>
                Feel free to explore our exciting travel packages and plan your next adventure with us! If you have any questions, don't hesitate to reach out.<br><br>
                Happy travels!<br><br>
                Best regards,<br>
                The Dream Trip Team</p>`;

                sendMAil(email, 'Welcome to Dream Trip!', message);


                return res.status(200).json({
                    message: 'Signup successfull',
                    status: true
                });
            }else{
                const status = 400;
                if(emailExists) return next({status: status, message: 'Email already exists'});
                else if(phoneExists) return next({status: status, message: 'Phone number already exists'});
                else return next({ status: 400, message: 'User already exists' });
            }
        }
    } catch (error) {
        console.log('Error in signup auth-controller:\n',error);
    }
}

const login = async (req, res, next) =>{
    try {        
        const {email, password} = req.body;

        if(!checkEmail(email)) return next({message: 'Please enter a valid email'});

        const userExists = await User.findOne({email});
        
        if(userExists){
            if(await userExists.verifyPass(password)){
                const message = `<p>Dear ${userExists.username},<br><br>
                Welcome back to Dream Trip! We're glad to see you again.<br><br>
                You have successfully logged in to your account. Here are some tips to get you started:<br>
                - Explore our latest travel packages and special offers.<br>
                - Update your profile with your preferences for a personalized experience.<br>
                - Check your upcoming trips and manage your bookings easily.<br><br>
                If you need any assistance, feel free to contact our support team. Enjoy planning your next adventure!<br><br>
                Happy travels!<br><br>
                Best regards,<br>
                The Dream Trip Team</p>`;

                sendMAil(email, 'Login Detected - Welcome Back!', message);


                return res.status(200).json({
                    message: 'Login successfull',
                    token: userExists.generateToken()
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

const user = async (req, res, next) =>{
    try {
        const userData = req.user;
        return res.status(200).json({userData});
    } catch (error) {
        console.log('Error in user auth-controller\n', error);
        return next({message: 'Unnable to fetch data'});
    }
}

const checkUsername = (username) => {
    const userRegex = /^[A-Za-z ]+$/;
    return userRegex.test(username);
}

const checkEmail = (email) =>{
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email);
}

const checkPass = (pass) => {
    const passRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/;

    return passRegex.test(pass);
}

const googleLogin = async(req, res, next) => {
    try {
        const profile = req.user._json;
        const userExists = await User.findOne({email: profile.email});

        // console.log('UserExists- ',userExists, "Email: ", profile.email);

        if(userExists){
            return res.status(200).json({
                message: 'Login successfull',
                token: userExists.generateToken(),
                userID: userExists._id.toString()
            });
        }else{
            next({message: "You don't have account yet. Create one."});
        }
    } catch (error) {
        console.log('Error in googleLogin: ',error);
    }
}

const resetPass = async(req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return next({ message: "User doesn't exist" });
        }

        const session = await generateRandom();

        const passResetEntry = new passReset({
            uniqueToken: session,
            userID: user._id,
            // time: Date.now() + 60000, // 1 min expiration
            time: Date.now(),
            isUsed: false
        });

        await passResetEntry.save();

        const resetToken = jwt.sign(
            { userID: user._id.toString(), email: user.email, _s: session },
            process.env.JWT_TOKEN,
            { expiresIn: '1h' }
        );

        const resetLink = `https://6hz6c9fr-5501.inc1.devtunnels.ms/passreset.html?token=${resetToken}`; 

        const message = `<p>Dear ${user.username},<br><br>
        You requested to reset your password. Please click the link below to reset your password:<br>
        <a href="${resetLink}">click here</a></p>`;

        sendMAil(email, 'Password Reset Request', message);

        return res.status(200).json({
            success: true,
            message: 'Password reset link sent! Please check your email.',
        });
    } catch (error) {
        console.log('Error in password reset link:\n', error);
        next({ message: 'Error sending password reset link' });
    }
}

const changePass = async(req, res, next) => {
    try {
        const { token, newPassword, cPassword } = req.body;

        if(newPassword===cPassword){
            if(!checkPass(newPassword)) return next({message: 'Password must contain atleast one Alphanumeric and special charectors'});
            else{
                // Verify the token
                const decoded = jwt.verify(token, process.env.JWT_TOKEN);
                const user = await User.findById(decoded.userID);

                if (!user) {
                    return res.status(400).json({ success: false, message: 'Invalid token or user does not exist' });
                }

                const resetEntry = await passReset.findOne({
                    uniqueToken: decoded._s,
                    userID: user._id          
                });

                if (!resetEntry){
                    return res.status(400).json({ success: false, message: 'Session expired!' });
                }

                await passReset.findByIdAndDelete(resetEntry._id);

                user.password = newPassword;
                await user.save();

                const message = `<p>Dear ${user.username},<br><br>
                Your password has been successfully changed.<br><br>
                If you did not request this change, please contact our support team immediately to secure your account.<br><br>
                Here are some tips to help keep your account secure:<br>
                - Use a strong, unique password that you haven't used before.<br>
                - Enable two-factor authentication for an extra layer of security.<br>
                - Avoid sharing your password with anyone.<br><br>
                If you have any questions or need assistance, feel free to reach out to us.<br><br>
                Thank you for being a part of Dream Trip!<br><br>
                Best regards,<br>
                The Dream Trip Team</p>`;

                sendMAil(user.email, 'Password Changed Successfully', message);


                return res.status(200).json({ success: true, message: 'Password reset successfully' });
            }
        }
    } catch (error) {
        console.log('Error resetting password:\n', error);
        return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
}

module.exports = {signup, login, user, googleLogin, resetPass, changePass};