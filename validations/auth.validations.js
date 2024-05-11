const { body } = require("express-validator");
exports.registerValidation = [
     body("userName", "The username must be between 3 and 15 characters and can only start with letters A-Z, a-z and contain numbers 0-9 or underscore")
          .notEmpty().bail()
          .isLength({ min: 3, max: 15 }).bail()
          .matches(/^(?![0-9_])[a-zA-Z0-9_]{3,16}$/),
     body("email")
          .notEmpty()
          .withMessage("Email address is required")
          .bail()
          .isEmail()
          .withMessage("Invalid email address")
          .bail()
          .normalizeEmail()
     
          ,
     body("password", "Enter a combination of digits, letters (A-Z, a-z)")
          .notEmpty()
          .withMessage("Password is required")
          .bail()
          .custom((value) => {
               const regex = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{6,20}$/;
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
 ,
     body("password",)
          .notEmpty()
          .withMessage("Password is required").trim()
     
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

     body(
          "password",
          "Enter a combination of digits, letters (A-Z, a-z)"
     )
          .custom((value) => {
               const regex =
               /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{6,20}$/;
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

