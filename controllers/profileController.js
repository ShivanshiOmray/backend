const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  const { name } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : req.user.photo;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { name, photo },
    { new: true }
  );

  res.json(updatedUser);
};
