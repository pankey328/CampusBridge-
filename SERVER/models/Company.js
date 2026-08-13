const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    website: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String, 
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    gstin: {
      type: String,
      trim: true, 
    },
    address: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
