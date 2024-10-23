const nodemailer = require('nodemailer');

const sendMAil = async (to, title, message) => {
    const from = process.env.MAIL_FROM;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: from, //your mail address from .env
            pass:  process.env.MAIL_SERVICE_PASS 
        }
    });

    const mailoptions = {
        from: from, //your mail address from .env
        to: to,
        subject: title,
        html: message
    }

    try {
        const response = await transporter.sendMail(mailoptions);
        console.log('Mail sent response: ',response);
    } catch (error) {
        console.log('Error in sending mail:\n',error);
    }
}

module.exports = sendMAil;