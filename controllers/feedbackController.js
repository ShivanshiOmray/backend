const Feedback = require("../models/Feedback");

exports.addFeedback = async (req, res) => {
  const { text, rating } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : "";

  const feedback = await Feedback.create({
    user: req.user._id,
    text,
    rating,
    image,
  });

  res.json(feedback);
};

exports.getFeedback = async (req, res) => {
  const feedbacks = await Feedback.find({ user: req.user._id }).sort({
    date: -1,
  });
  res.json(feedbacks);
};
