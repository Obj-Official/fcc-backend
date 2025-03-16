const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  bookingID: { type: String, required: true },
  serviceName: { type: Array, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, match: /\S+@\S+\.\S+/ },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: true },
  occupation: { type: String, required: true },
  nextOfKinFullName: { type: String, required: true },
  nextOfKinPhone: { type: String, required: true },
  nextOfKinEmail: { type: String, required: true, match: /\S+@\S+\.\S+/ },
  relationshipWithNextOfKin: { type: String, required: true },
  timeOfBooking: { type: Date, default: Date.now },
  pdfBase64URL: { type: String },
  approved: { type: Boolean, default: false },
  canceled: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("Booking", bookingSchema);
