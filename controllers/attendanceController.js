const Attendance = require("../models/Attendance");

exports.getAttendance = async (req, res) => {
  const attendance = await Attendance.find({ user: req.user._id }).sort({
    date: -1,
  });
  res.json(attendance);
};

exports.markAttendance = async (req, res) => {
  const { status } = req.body;
  const newAttendance = await Attendance.create({ user: req.user._id, status });
  res.json(newAttendance);
};
