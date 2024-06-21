const mongoose = require("mongoose");

// Define the enum for project fields
const projectFieldsEnum = [
  "Marketing Campaigns",
  "Product Development",
  "Sales Initiatives",
  "Healthcare IT Implementation",
  "Engineering Projects",
  "Clinical Trials Management",
  "Data Science and Analytics",
  "Software Engineering Projects",
  "Event Planning",
  "Cybersecurity Initiatives",
  "Others",
];

const analysisSchema = new mongoose.Schema(
  {
    // User Metrics
    totalUsers: {
      type: Number,
      default: 0,
    },
    activeUsers: {
      type: Number,
      default: 0,
    },
    deletedUsers: {
      type: Number,
      default: 0,
    },
    // Project Metrics
    totalProjects: {
      type: Number,
      default: 0,
    },
    activeProjects: {
      type: Number,
      default: 0,
    },
    completedProjects: {
      type: Number,
      default: 0,
    },
    deletedProjects: {
      type: Number,
      default: 0,
    },
    // Age Range Distribution
    ageRangeDistribution: {
      type: Map,
      of: Number,
      default: new Map([
        ["18-24", 0],
        ["25-30", 0],
        ["31-35", 0],
        ["36-40", 0],
        ["41-45", 0],
        ["46-50", 0],
        ["51-55", 0],
        ["56-60", 0],
        ["60+", 0],
      ]),
    },
    // User Field Percentage
    userFieldPercentage: {
      type: Map,
      of: Number,
      default: Object.fromEntries(projectFieldsEnum.map((field) => [field, 0])),
      enum: projectFieldsEnum,
    },
    // Project Field Percentage
    projectFieldPercentage: {
      type: Map,
      of: Number,
      default: Object.fromEntries(projectFieldsEnum.map((field) => [field, 0])),
      enum: projectFieldsEnum,
    },
  },
  {
    versionKey: false,
  }
);

// Ensure only one document is created with a fixed ID
analysisSchema.statics.getSingleton = async function () {
    try {
      let analysis = await this.findOne();
      if (!analysis) {
        analysis = await this.create({ _id: "singleton" });
      }
      return analysis;
    } catch (error) {
      console.error("Error creating analysis document:", error);
      throw error;
    }
  };

const Analysis = mongoose.model("Analysis", analysisSchema);

module.exports = Analysis;
