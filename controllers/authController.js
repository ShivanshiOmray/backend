// const User = require("../models/User");
// const jwt = require("jsonwebtoken");

// // Temporary OTP store (use Redis in production)
// let otpStore = {};

// exports.sendOtp = async (req, res) => {
//   const { phone } = req.body;
//   const otp = Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
//   otpStore[phone] = otp;

//   console.log(`OTP for ${phone}: ${otp}`); // For testing

//   res.json({ message: "OTP sent successfully (check console in dev mode)" });
// };

// exports.verifyOtp = async (req, res) => {
//   const { phone, otp } = req.body;
//   if (otpStore[phone] != otp)
//     return res.status(400).json({ message: "Invalid OTP" });

//   let user = await User.findOne({ phone });
//   if (!user) user = await User.create({ name: "New Student", phone });

//   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//     expiresIn: "7d",
//   });
//   delete otpStore[phone];
//   res.json({ token, user });
// };

const nodemailer = require("nodemailer");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

let otpStore = {}; // { email: { otp, expiry, lastSent } }

// ✅ Nodemailer Setup (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Send OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
  const now = Date.now();

  // Rate limiting: Allow OTP request only every 60 seconds
  if (
    otpStore[email] &&
    otpStore[email].lastSent &&
    now - otpStore[email].lastSent < 60 * 1000
  ) {
    const waitTime = Math.ceil(
      (60 * 1000 - (now - otpStore[email].lastSent)) / 1000
    );
    return res
      .status(429)
      .json({
        message: `Please wait ${waitTime}s before requesting a new OTP.`,
      });
  }

  // Store OTP with expiry (5 minutes)
  otpStore[email] = { otp, expiry: now + 5 * 60 * 1000, lastSent: now };

  try {
    await transporter.sendMail({
      from: `"Student App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    res.json({ message: "OTP sent to email successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ✅ Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record)
    return res.status(400).json({ message: "OTP not found or expired" });
  if (Date.now() > record.expiry)
    return res
      .status(400)
      .json({ message: "OTP expired. Please request a new one." });
  if (record.otp != otp)
    return res.status(400).json({ message: "Invalid OTP" });

  let user = await User.findOne({ email });
  if (!user) user = await User.create({ name: "New Student", email });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  delete otpStore[email]; // Remove OTP after verification
  res.json({ token, user });
};
