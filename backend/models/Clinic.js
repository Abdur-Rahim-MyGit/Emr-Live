const mongoose = require("mongoose");

const clinicSchema = new mongoose.Schema(
  {
    clinicId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    yearOfEstablishment: { type: Number },
    address: {
      type: String,
      required: true,
    },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String },
    ownerName: { type: String, required: true },
    ownerMedicalId: { type: String },
    adminContact: { type: String, required: true },
    adminEmail: { type: String, required: true },
    specialties: [{ type: String }],
    services: [{ type: String }],
    operatingHours: { type: String },
    paymentMethods: [{ type: String }],
    bankInfo: { type: String },
    adminUsername: { type: String, required: true },
    adminPassword: { type: String, required: true },

    // Legal & Compliance Fields
    gstNumber: { type: String },
    panNumber: { type: String },
    tanNumber: { type: String },
    bankAccountNumber: { type: String },
    complianceDocuments: [
      {
        fileName: String,
        filePath: String,
        fileType: String,
        uploadDate: { type: Date, default: Date.now },
      },
    ],

    // Additional Users
    additionalUsers: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, default: "user" },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    isActive: { type: Boolean, default: true },

    // Password Reset OTP fields
    resetOTP: { type: String },
    resetOTPExpires: { type: Date },

    // Clinic Duration/Validity Period
    validityPeriod: {
      startDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
      endDate: {
        type: Date,
        required: true,
      },
      duration: {
        type: Number, // Duration in months
        required: true,
      },
      isExpired: {
        type: Boolean,
        default: false,
      },
      renewalHistory: [
        {
          previousEndDate: Date,
          newEndDate: Date,
          renewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          renewalDate: { type: Date, default: Date.now },
          renewalReason: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate duration and validate dates - DISABLED for updates
// clinicSchema.pre("save", function (next) {
//   if (
//     this.validityPeriod &&
//     this.validityPeriod.startDate &&
//     this.validityPeriod.endDate
//   ) {
//     // Calculate duration in months
//     const start = new Date(this.validityPeriod.startDate);
//     const end = new Date(this.validityPeriod.endDate);
//     const diffTime = Math.abs(end - start);
//     const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average month length
//     this.validityPeriod.duration = diffMonths;

//     // Check if clinic is expired
//     this.validityPeriod.isExpired = new Date() > end;
//   }
//   next();
// });

// Instance methods
clinicSchema.methods.isExpired = function () {
  return this.validityPeriod && new Date() > this.validityPeriod.endDate;
};

clinicSchema.methods.getDaysUntilExpiry = function () {
  if (!this.validityPeriod || !this.validityPeriod.endDate) return null;
  const now = new Date();
  const endDate = new Date(this.validityPeriod.endDate);
  const diffTime = endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

clinicSchema.methods.renewValidity = function (newEndDate, renewedBy, reason) {
  if (!this.validityPeriod) return false;

  // Add to renewal history
  this.validityPeriod.renewalHistory.push({
    previousEndDate: this.validityPeriod.endDate,
    newEndDate: newEndDate,
    renewedBy: renewedBy,
    renewalReason: reason,
  });

  // Update end date
  this.validityPeriod.endDate = newEndDate;
  this.validityPeriod.isExpired = false;

  return true;
};

// Static methods
clinicSchema.statics.findExpiringSoon = function (days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    "validityPeriod.endDate": { $lte: futureDate, $gte: new Date() },
    "validityPeriod.isExpired": false,
  });
};

clinicSchema.statics.findExpired = function () {
  return this.find({
    "validityPeriod.endDate": { $lt: new Date() },
  });
};

module.exports = mongoose.model("Clinic", clinicSchema);
