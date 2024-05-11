const nodemailer = require('nodemailer');

const CONTACT_PASS = process.env.CONTACT_PASS;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL;
const { getCurrentGMTDate } = require("../helpers/time-formats")
// const pass = 'B3Q@Z&qW*MgHF_3'

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    // if false, port = 587 and if true, port = 465
    secure: true,
    auth: {
        user: CONTACT_EMAIL,
        pass: CONTACT_PASS,
    },
});



exports.send_pass_reset_email = async(email) =>{
    const resetPassHtml = `   
            <div style="padding: 80px 0px;">

            <div style="border: none; border-radius: 8px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1);
            margin: auto; background-color: #ffffff; width: 500px; margin: auto; height: fit-content;">

            <div style="  padding: 10px 10px 0px 10px;">
            <h5 style=" padding: 10px 10px 5px 10px; margin: 0px;
            font-family: SFProDisplay-Bold, Helvetica, Arial, sans-serif; font-size: 18px; line-height: 24px;"> 
            Reset Password </h5>
            </div>
            <hr style="color: rgb(182 182 182);" />
            <div> 
            <p style="padding: 20px 20px 5px;">
            A password reset event has been triggered. The password reset window is limited to one hours.

            If you do not reset your password within one hour, you will need to submit a new request.

            To complete the password reset process, visit the following link:
            </p>
            <p style="padding: 5px 20px; margin:0px"> ${email.resetLink}</p>
            <table style="padding: 5px 20px;">
            <tbody><tr><td>Username</td><td> ${email.to}</td></tr>
            <tr><td>IP Address</td><td>${"192.168.1.1"}</td></tr>
            <tr><td>Created</td><td>${getCurrentGMTDate()}</td></tr>
            </tbody></table>
            </div>
            </div>
            </div>
            `
    const info = await transporter.sendMail({
        from: email.from,
        to: email.to,
        subject: email.subject,
        html: resetPassHtml,

    });
    return info;
}


