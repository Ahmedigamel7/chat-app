const router = require("express").Router();
const bcrypt = require("bcrypt")
const CONTACT_EMAIL = process.env.CONTACT_EMAIL;
const { notAuth, isAuth } = require("./guards/protect.routes");
const { User } = require("../models/user.model");
const {
     validate,
     registerValidation,
     loginValidation, emailValidation, newPasswordValidation
} = require("../validations/auth.validations");
const { validationResult } = require("express-validator");
const { send_pass_reset_email } = require('../mail/mailer');
const { gen_token } = require("../helpers/genKeys");
const { get_user_input } = require("../helpers/user-input");

router.get("/register", notAuth, (req, res, next) => {
     try {
          const validation = req.flash("register")[0];
          const inputs = req.flash("inputs");
     
          if (validation) {
               let statusCode = 422;
     
               // check if duplicate username or email address
               let conflict = false;
               if (validation.msg === "The username is unavailable" || validation.msg === "Email already exists")
                    conflict = true;
     
               if (conflict) statusCode = 409;
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
                    let { param, msg } = user.userName === reqUser.userName ? { param: 'userName', msg: 'The username is unavailable' }
                         : { param: 'email', msg: 'Email already exists' };
                    req.flash('register', [{ param, msg }])
                    req.flash("inputs", get_user_input(req?.body))
                    return res.redirect('/auth/register')
               }
               const newUser = new User(reqUser);
               // hash_password then retuen saved user
               await newUser.hash_password();
               return res.redirect("/auth/login");
          }
     } catch (error) {
          return next(error);
     }
}
     // const newUser = new User({ userName: req.body.userName, email: req.body.email, password: req.body.password });
     // newUser.save({});
);

router.get("/login", notAuth, (req, res, next) => {
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
});

router.post("/login", notAuth, loginValidation, async (req, res, next) => {
     if (!validationResult(req).isEmpty()) {
          req.flash("login", validationResult(req).array());
          res.redirect("/auth/login");
     } else {
          try {
               const user = await User.findOne({ email: req.body.email });
               if (!user) {
                    req.flash('login', [{ param: 'email', msg: "Invalid username or password" }])
                    return res.redirect('/auth/login');
               }
               const correctPass = await bcrypt.compare(req.body.password, user.password);
               if (!correctPass) {
                    req.flash('login', [{ param: 'email', msg: "Invalid username or password" }])
                    return res.redirect('/auth/login');
               }
               req.session.userId = user._id;
               req.session.name = user.userName;
               req.session.img = user.image;
               return res.redirect("/");
          } catch (error) {
               console.error(error);
               return next(error);
          }
     }
});

router.post("/logout", isAuth, (req, res, next) => {
     req.session.destroy((err) => {
          if (err) return next(err);
          return res.redirect("/auth/login");
     });
});


router.get('/login/identify', notAuth, (req, res, next) => {
     const validations = req.flash('identifyUser');
     console.log(validations)

     res.render('identifying-user', { isUser: null, validation: validations[0] })
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
                         param: 'email', msg: new Error("Email doesn't exists").message
                    }

                    req.flash("identifyUser", error);
                    return res.redirect("/auth/login/identify");
               }

               const user = ({ email, image } = isUser);

               return res.render('pass-recover', { isUser: null, user });
          }
     } catch (error) {
          return next(error)
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
                    resetLink: `https://localhost:5555/auth/login/reset/password/${token}`
               }

               const info = await send_pass_reset_email(email);
               console.log(info)
               if (info.accepted.length === 0) {
                    const error = {
                         status: 500, name: "RESET PASS EMAIL FAILED",
                         msg: 'Something went wrong!'
                    }
                    return next(error);
               }

               return res.redirect('/auth/login')
          }
          return res.redirect('/auth/login')
     } catch (error) {
          next(error)
     }
})

router.get('/login/reset/password/:token', async (req, res, next) => {
     try {
          let statusCode = 200;
          const { token } = req.params;
          const validations = req.flash("resetPass");
          const error = req.flash('wrongUserOrExpired')
          console.log(validations)
          if (error.length > 0) {
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
               isUser: null, validation: validations[0],
               resetPasswordToken: token,
               error: undefined
          })

     } catch (error) {
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
               return res.redirect('/auth/login')
          }
     } catch (error) {
          next(error)
     }
})

module.exports = router;

