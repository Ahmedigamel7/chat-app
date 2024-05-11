const router = require("express").Router();
const bcrypt = require("bcrypt")
const CONTACT_EMAIL = process.env.CONTACT_EMAIL;
const { notAuth, isAuth } = require("./guards/protect.routes");
const { User } = require("../models/user.model");
const {
     registerValidation,
     loginValidation, emailValidation, newPasswordValidation
} = require("../validations/auth.validations");
const { validationResult } = require("express-validator");
const { send_pass_reset_email } = require('../mail/mailer');
const { gen_token } = require("../helpers/genKeys");
const { get_user_input } = require("../helpers/user-input");

router.get("/register", notAuth, async (req, res, next) => {
     try {
          const validation = req.flash("register")[0];
          const inputs = req.flash("inputs");
     
          if (validation) {
               let statusCode = 422;

               // check if duplicate username or email address
               if (validation.msg === "The username is unavailable" || validation.msg === "Email already exists")
                    statusCode = 409;

               return res.status(statusCode).render("register", {
                    isUser: req.session.userId || null,
                    validation,
                    inputs,
                    friendReqs: req.friendReqs || null,
               });
          } else
               res.render("register", {
                    isUser: req.session.userId || null,
                    validation,
                    inputs,
                    friendReqs: req.friendReqs || null,
               });
     } catch (error) {
          await log.error("GET -- /register", {error })
          next(error)
     }

});

router.post("/register", notAuth, registerValidation, async (req, res, next) => {
     try {
          if (!validationResult(req).isEmpty()) {
               req.flash("register", validationResult(req).array());
               req.flash("inputs", get_user_input(req?.body))
               res.redirect("/auth/register");

          } else {
               const reqUser = ({ userName, email, password } = req.body);
               const user = await User.findOne({ $or: [{ email: reqUser.email }, { userName: reqUser.userName }] });
               if (user) {
                    //which input is already exists.
                    let { path, msg } = user.userName === reqUser.userName ? { path: 'userName', msg: 'The username is unavailable' }
                         : { path: 'email', msg: 'Email already exists' };
                    req.flash('register', [{ path, msg }])
                    req.flash("inputs", get_user_input(req?.body))
                    return res.redirect('/auth/register')
               }
               const newUser = new User(reqUser);
               // hash_password 
               await newUser.hash_password();
               return res.redirect("/auth/login");
          }
     } catch (error) {
          await log.error("POST -- /register", {  error })
          return next(error);
     }
}
);

router.get("/login", notAuth, async (req, res, next) => {
     try {
          const validations = req.flash("login");
          if (validations.length > 0) {
               return res.status(401).render("login", {
                    isUser: req.session.userId || null,
                    validation: validations[0],
                    friendReqs: req.friendReqs || null,
               });
          } else
               res.render("login", {
                    isUser: req.session.userId || null,
                    validation: undefined,
                    friendReqs: req.friendReqs || null,
               });
     } catch (error) {
          await log.error("GET -- /login", {error })

          next(error)
     }
});

const Logger = require('../services/logger');
const { error } = require("winston");
const log = new Logger('auth.routes');

router.post("/login", notAuth, loginValidation, async (req, res, next) => {
     if (!validationResult(req).isEmpty()) {
          req.flash("login", validationResult(req).array());
          res.redirect("/auth/login");
     } else {
          try {
               const user = await User.findOne({ email: req.body.email });
               if (!user) {
                    req.flash('login', [{ path: 'email', msg: "Invalid username or password" }])
                    await log.info('NOT A USER', { method: "POST -- /login" });
                    return res.redirect('/auth/login');
               }
               const correctPass = await bcrypt.compare(req.body.password, user.password);
               if (!correctPass) {
                    req.flash('login', [{ path: 'email', msg: "Invalid username or password" }])
                    await log.info('WRONG PASSWORD', { method: "POST -- /login" });
                    return res.redirect('/auth/login');
               }
               req.session.userId = user._id;
               req.session.name = user.userName;
               req.session.img = user.image;
               await log.info('USER LOGGED IN', { id: user.id, username: user.userName })
               return res.redirect("/");
          } catch (error) {
               await log.error("POST --/login", { error })
               return next(error);
          }
     }
});

router.post("/logout", isAuth, async (req, res, next) => {
     try {
          req.session.destroy(async (err) => {
               if (err) {
                    await log.error("DESTROYING SESSION", { err })
                    return next(err);
               }
               await log.info('USER LOGGED OUT', { id: req.session.userId, username: req.session.name })
               return res.redirect("/auth/login");
          });
     } catch (error) {
          await log.error("POST --/logout", { error })
          next(error)
     }
});


router.get('/login/identify', notAuth, async (req, res, next) => {
     try {
          const validations = req.flash('identifyUser');
          await log.info("GET -- /login/identify -- validation", { validations })
          res.render('identifying-user', { isUser: null, validation: validations[0] })
     }
     catch {
          await log.error("GET -- /login/identify", { error })
          next(error)
     }
})

router.post('/login/identify', notAuth, emailValidation, async (req, res, next) => {
     try {
          if (!validationResult(req).isEmpty()) {
               req.flash("identifyUser", validationResult(req).array());
               res.redirect("/auth/login/identify");
          }
          else {
               const isUser = await User.findOne({ email: req.body.email });
               if (!isUser) {
                    const error = {
                         path: 'email', msg: new Error("Email doesn't exists").message
                    }
                    req.flash("identifyUser", error);
                    return res.redirect("/auth/login/identify");
               }
               const user = { email, image } = isUser;
               await log.info("POST -- /login/identify", { id: isUser.id, username: isUser.userName })
               return res.render('pass-recover', { isUser: null, user });
          }
     } catch (error) {
          await log.error("POST -- /login/identify", { error })
          next(error)
     }

})

router.post('/login/recover-email', notAuth, async (req, res, next) => {
     try {
          const isUser = await User.findOne({ email: req.body.email });
          if (isUser) {
               const token = await gen_token();
               if (token) {
                    isUser.resetPasswordToken = token;
                    isUser.resetTokenExpiration = Date.now() + 60 * 60 * 1000; //Hour
                    await isUser.save()
               };

               const email = {
                    from: CONTACT_EMAIL,
                    to: isUser.email,
                    subject: "Password Reset",
                    resetLink: `${process.env.RESET_LINK}${token}`
               }

               const info = await send_pass_reset_email(email);
               if (info.accepted.length === 0 ) {
                    const error = {
                         status: 500, name: "RESET PASS EMAIL FAILED",
                         msg: 'Something went wrong!'
                    }
                    await log.error(err?.msg, { error })
                    return next(error);
               }
               await log.info("POST -- /login/recover-email", { info })
               return res.redirect('/auth/login')
          }
          return res.redirect('/auth/login')
     } catch (error) {
          await log.error("POST -- /login/recover-email", { error })
          next(error)
     }
})

router.get('/login/reset/password/:token', async (req, res, next) => {
     try {
          let statusCode = 200;
          const { token } = req.params;
          const validations = req.flash("resetPass");
          const error = req.flash('wrongUserOrExpired')
          if (error.length > 0) {
               await log.info("GET -- /login/reset/password/:token", { error })
               statusCode = error[0].status;
               return res.status(statusCode).render('reset-pass', {
                    isUser: null, validation: validations,
                    resetPasswordToken: token,
                    error: error[0]
               })
          }
          if (validations.length > 0)
               statusCode = 422;

          return res.status(statusCode).render('reset-pass', {
               isUser: null,
               validation: validations[0],
               resetPasswordToken: token,
               error: undefined
          })

     } catch (error) {
          await log.error("GET -- /login/reset/password/:token", { error })
          next(error)
     }
})

router.post('/login/reset/password/:token', newPasswordValidation, async (req, res, next) => {
     try {
          const { token } = req.params;
          if (!validationResult(req).isEmpty()) {
               req.flash("resetPass", validationResult(req).array());
               res.redirect(`/auth/login/reset/password/${token}`);
          }
          else {
               const { password } = req.body;

               const user = await User.findOne({
                    resetPasswordToken: token,
                    resetTokenExpiration: { $gt: Date.now() }
               });
               if (!user) {
                    req.flash('wrongUserOrExpired', [{
                         status: 400,
                         name: "RESET PASS",
                         msg: 'Password reset expired.'
                    }])
                    return res.redirect(`/auth/login/reset/password/${token}`)
               }

               user.resetPasswordToken = undefined;
               user.resetTokenExpiration = 0;
               await user.hash_password(password);
               await log.info("POST -- /login/reset/password/:token -- new password", { id: user, username: user.userName })

               return res.redirect('/auth/login')
          }
     } catch (error) {
          await log.error("POST -- /login/reset/password/:token", { error })
          next(error)
     }
})

module.exports = router;

