

const User = require("../../models/User");
const router = require("express").Router();
const authMiddleware = require("../../utils/auth");
const validatePassword = require("../../utils/validatePassword");

router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log(email);
        console.log(password);

        const user = await User.findOne({ email });
        console.log(user);
        if (!user) {
            return res
                .status(404)
                .json({ message: "No user with that username!" });
        }

        const validPassword = await user.comparePassword(password);
        if (!validPassword) {
            return res.status(401).json({ message: "Incorrect password!" });
        }
        const token = authMiddleware.signToken(user);
        res.json({ token });
    } catch (error) {
        next(error);
    }
});

router.post("/logout", (req, res) => {
    req.status(200).json({ message: "You are now logged out!" });
});

router.post("/signup", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log("Creating user with:", email, password);
        if (!email || !password) {
            return res.status(400).json({
                message: "You must provide an email and password!",
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a special character.",
            });
        }

        const user = await User.create({ email, password });
        const token = authMiddleware.signToken(user);
        res.json({ token });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Email already exists!",
            });
        }
        next(error);
    }
    
}
);

module.exports = router;