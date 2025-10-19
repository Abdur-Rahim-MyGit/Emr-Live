// models/Patient.js

const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    // --- EXISTING FIELDS ---
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    lastName: { type: String, trim: true }, // Added for easier display
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    maritalStatus: { type: Boolean, required: true },
    aadhaarNumber: { type: String, required: true },
    attenderEmail: { type: String, required: true },
    attenderMobile: { type: String, required: true },
    attenderWhatsapp: { type: String },
    city: { type: String, required: true },
    nationality: { type: String, required: true },
    pinCode: { type: String, required: true },
    modeOfCare: {
      type: String,
      enum: ["In-person", "Virtual", "Hybrid", "Home Care"],
      required: true,
    },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    emergencyContact: { name: String, relationship: String, phone: String },
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      groupNumber: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    // --- NEW FIELDS ADDED FOR DETAILED VIEW ---
    category: { type: String, default: "Classic" },
    imageUrl: { type: String, default: "https://i.imgur.com/8KMKach.png" },

    clinicCategoryHistory: [
      {
        sno: Number,
        oldCategory: String,
        newCategory: String,
        datedOn: { type: Date, default: Date.now },
      },
    ],
    checkInHistory: [
      {
        sno: Number,
        clinicType: String,
        clinicName: String,
        checkedInOn: { type: Date, default: Date.now },
      },
    ],
    paymentCreditHistory: [
      {
        sno: Number,
        payMode: String,
        reference: String,
        creditedBy: String,
        creditedOn: { type: Date, default: Date.now },
        amount: Number,
      },
    ],
    paymentDebitHistory: [
      {
        sno: Number,
        payType: String,
        reference: String,
        details: String,
        debitedOn: { type: Date, default: Date.now },
        amount: Number,
      },
    ],

    // Case Log and Medical Tracking
    caseLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientCaseLog"
    },
    
    // Login Tracking
    loginTracking: {
      lastLoginTime: { type: Date },
      lastLogoutTime: { type: Date },
      totalLogins: { type: Number, default: 0 },
      isCurrentlyLoggedIn: { type: Boolean, default: false },
      loginStreak: { type: Number, default: 0 },
      lastActiveDate: { type: Date }
    },

    // Medical Summary (Quick Access)
    medicalSummary: {
      activeCases: { type: Number, default: 0 },
      totalCases: { type: Number, default: 0 },
      lastVisitDate: { type: Date },
      nextAppointmentDate: { type: Date },
      chronicConditions: [String],
      currentMedications: [String],
      allergies: [String],
      lastUpdated: { type: Date, default: Date.now }
    },

    // Privacy and Access Control
    privacySettings: {
      allowDataSharing: { type: Boolean, default: false },
      allowResearchParticipation: { type: Boolean, default: false },
      allowMarketingCommunications: { type: Boolean, default: false },
      dataRetentionPeriod: { type: Number, default: 7 }, // years
      lastUpdated: { type: Date, default: Date.now }
    }
  },
  {
    timestamps: true,
  }
);

// Hook to generate a unique PID before saving
patientSchema.pre("save", async function (next) {
  if (this.isNew && !this.pid) {
    const today = new Date();
    const year = String(today.getFullYear()).slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const count = await mongoose.models.Patient.countDocuments();
    this.pid = `${year}${month}${day}${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Patient", patientSchema);
