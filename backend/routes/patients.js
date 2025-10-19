// routes/patients.js

const express = require("express");
const Patient = require("../models/Patient");
const User = require("../models/User"); // Ensure User model is imported
const { auth } = require("../middleware/auth");

const router = express.Router();

// Add patient
router.post("/", auth, async (req, res) => {
  try {
    const user = new User({
      // Using a placeholder name for the associated user account
      firstName: req.body.fullName.split(" ")[0],
      lastName: "User",
      email: req.body.attenderEmail,
      phone: req.body.attenderMobile,
      role: "patient",
      clinicId: req.user.clinicId,
    });
    await user.save();

    // Extract last name from full name
    const nameParts = req.body.fullName.split(" ");
    const lastName = nameParts.length > 1 ? nameParts.pop() : "";

    const patientData = {
      ...req.body,
      lastName: lastName,
      userId: user._id,
      clinicId: req.user.clinicId,
      // Initialize new fields with default or empty values
      wallet: { general: 3430, pharmacy: 32 }, // Example initial values
      // The following will be populated with mock data for demonstration
      clinicCategoryHistory: [
        {
          sno: 1,
          oldCategory: "Classic",
          newCategory: "Classic",
          datedOn: new Date("2023-11-13T10:21:00Z"),
        },
      ],
      checkInHistory: [
        {
          sno: 1,
          clinicType: "LIG",
          clinicName: "Integrated Clinic 1",
          checkedInOn: new Date("2023-11-24T10:32:00Z"),
        },
        {
          sno: 2,
          clinicType: "UG",
          clinicName: "Ward 1 - OBG",
          checkedInOn: new Date("2023-11-20T12:48:00Z"),
        },
        {
          sno: 3,
          clinicType: "PG",
          clinicName: "OBG",
          checkedInOn: new Date("2023-11-15T11:32:00Z"),
        },
      ],
      paymentCreditHistory: [
        {
          sno: 1,
          payMode: "ADM FREE",
          reference: "231113150213206",
          creditedBy: "Vincent B",
          creditedOn: new Date("2023-11-13T10:22:00Z"),
          amount: 5000,
        },
      ],
      paymentDebitHistory: [
        {
          sno: 1,
          payType: "Wallet",
          reference: "Item Cost",
          details: "General Ward Bed charge per day",
          debitedOn: new Date("2024-04-07T14:18:00Z"),
          amount: 20,
        },
      ],
    };

    const patient = new Patient(patientData);
    await patient.save();

    res
      .status(201)
      .json({ success: true, message: "Patient added successfully", patient });
  } catch (error) {
    console.error("Patient creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add patient",
      error: error.message,
    });
  }
});

// GET all patients - This route works as is, will return new fields automatically
router.get("/", auth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== "super_master_admin") {
      filter.clinicId = req.user.clinicId;
    }
    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, patients });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
      error: error.message,
    });
  }
});

// GET patient by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      "userId",
      "firstName lastName email phone"
    );
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }
    // Check if user has access to this patient's clinic
    if (
      req.user.role !== "super_master_admin" &&
      patient.clinicId.toString() !== req.user.clinicId.toString()
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    res.json({ success: true, patient });
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient",
      error: error.message,
    });
  }
});

// PUT update patient
router.put("/:id", auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }
    // Check if user has access to this patient's clinic
    if (
      req.user.role !== "super_master_admin" &&
      patient.clinicId.toString() !== req.user.clinicId.toString()
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({
      success: true,
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update patient",
      error: error.message,
    });
  }
});

// DELETE patient
router.delete("/:id", auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }
    // Check if user has access to this patient's clinic
    if (
      req.user.role !== "super_master_admin" &&
      patient.clinicId.toString() !== req.user.clinicId.toString()
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete patient",
      error: error.message,
    });
  }
});

module.exports = router;
