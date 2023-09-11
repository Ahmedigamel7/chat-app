const { body } = require("express-validator");
const bcrypt = require("bcrypt");
const { User } = require("../models/user.model");

exports.registerValidation = [
     body("userName", "The username must be between 6 and 15 characters and can only start with letters A-Z, a-z and contain numbers 0-9 or underscore")
          .notEmpty().bail()
          .isLength({ min: 6, max: 15 }).bail()
          .matches(/^(?![0-9_])[a-zA-Z0-9_]{6,16}$/),
     body("email")
          .notEmpty()
          .withMessage("Email address is required")
          .bail()
          .isEmail()
          .withMessage("Invalid email address")
          .bail()
          .normalizeEmail()
          // .custom(async (value) => {
          //      try {
          //           const user = await User.findOne({ email: value });
          //           if (user) return Promise.reject(new Error("Email Already Exists"));
          //           else return Promise.resolve(true);
          //      } catch (error) {
          //           console.error(error.name, error.message);
          //           // return ;
          //      }
          // }),
          ,
     body("password", "Enter a combination of at least 6 numbers, letters and punctuation marks (such as ! and &)")
          .notEmpty()
          .withMessage("Password is required")
          .bail()
          .custom((value) => {
               const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!&])[a-zA-Z\d!&]{6,}$/;
               if (value && regex.test(value)) return true;
               else return false;
          })
          .trim(),


     body("passwordConfirmation")
          // .if((value, { req }) => req.body.password)
          .notEmpty()
          .withMessage("Confirmation password is required")
          .bail()
          .custom((value, { req }) => {
               if (req.body.password === value) return true;
               else throw new Error("Passwords should be equals");
          }).trim()
];

exports.loginValidation = [
     body("email")
          .notEmpty()
          .withMessage("Email is required")
          .bail()
          .isEmail()
          .withMessage("Invalid email")
          .bail()
          .normalizeEmail()
     // .custom(async (value, { req }) => {
     //      try {
     //           const user = await User.findOne({ email: value });
     //           // console.log(user);
     //           if (!user) return Promise.reject(new Error("Invalid username or password"));

     //           else  return Promise.resolve(true);

     //      } catch (error) {
     //           console.error(error.name, error.message);
     //           // return error;
     //      }
     // }),
     ,
     body("password",)
          .notEmpty()
          .withMessage("Password is required").trim()
     // .custom(async (value, { req }) => {
     //      try {
     //           const user = await User.findOne({ email: req.body.email });
     //           const result = await bcrypt.compare(value, user.password);
     //           if (!result) return Promise.reject(new Error("Wrong username or password"));
     //           else {
     //                req.session.userId = user._id;
     //                req.session.name = user.userName;
     //                req.session.img = user.image;
     //                return Promise.resolve(result);
     //           }
     //      } catch (error) {
     //           // console.log("catchemail");
     //           console.log(error.message);
     //           // createError.InternalServerError();
     //      }
     // }),
];

exports.validate = (validations) => {
     return async (req, res, next) => {
          for (let validation of validations) {
               const result = await validation.run(req);
               if (result.errors.length) break;
          }
          return next();
     };
};

exports.emailValidation = body('email', 'Invalid email address.').isEmail().normalizeEmail();

exports.newPasswordValidation = [
     // body("userId").isMongoId(),
     body(
          "password",
          "Enter a combination of at least 6 numbers, letters and punctuation marks (such as ! and &)"
     )
          .custom((value) => {
               const regex =
                    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!&])[a-zA-Z\d!&]{6,}$/;
               if (value && regex.test(value)) return true;
               else return false;
          })
          .trim(),
     body("confirmPassword")
          .custom((value, { req }) => {
               if (value && value === req.body.password) return true;
               else throw new Error("Passwords have to match!");
          })
          .trim(),
]

// const { body } = require("express-validator");
// const { User } = require("../models/user.model");

// exports.userRole = [
//      body("email")
//           .notEmpty()
//           .withMessage("Email is required")
//           .bail()
//           .isEmail()
//           .withMessage("Invalid email")
//           .bail()
//           .normalizeEmail()
//           .custom(async (value, { req }) => {
//                try {
//                     const user = await User.findOne({ email: value });
//                     console.log(user);
//                     if (!user) return Promise.reject(new Error("Email doesn't exist"));
//                     else {
//                          req.flash("user", user);
//                          return Promise.resolve(true);
//                     }
//                } catch (error) {
//                     console.error(error.name, error.message);
//                     // return error;
//                }
//           }),
// ];

// exports.newProductValidation = [
//      body("name").notEmpty().withMessage("name is required").bail().isString(),
//      body("description").notEmpty().withMessage("description is required").bail().isString(),
//      body("category").notEmpty().withMessage("category is required").bail().isString(),
//      body("amount").notEmpty().withMessage("amount is required").bail().isInt({ allow_leading_zeroes: false }),
//      body("image").custom((value, { req }) => {
//           if (req.file) return true;
//           else throw "image is required";
//      }),
//      body("price")
//           .notEmpty()
//           .withMessage("price is required")
//           .bail()
//           .isCurrency({ allow_negatives: false, decimal_separator: true, allow_decimal: true }),
// ];
