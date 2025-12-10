const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    originalName: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    cloudinaryId: {
      type: String,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'doc'],
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
    },
    rawText: {
      type: String, // Extracted text from resume
    },
    parsedData: {
      summary: {
        type: String,
      },
      contactInfo: {
        email: String,
        phone: String,
        location: String,
        linkedIn: String,
        github: String,
        portfolio: String,
      },
      skills: [
        {
          type: String,
          lowercase: true,
          trim: true,
        },
      ],
      experience: [
        {
          company: String,
          title: String,
          location: String,
          startDate: String,
          endDate: String,
          current: Boolean,
          description: String,
          highlights: [String],
        },
      ],
      education: [
        {
          institution: String,
          degree: String,
          field: String,
          location: String,
          graduationDate: String,
          gpa: String,
          highlights: [String],
        },
      ],
      certifications: [
        {
          name: String,
          issuer: String,
          date: String,
          expiryDate: String,
          credentialId: String,
        },
      ],
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
          url: String,
        },
      ],
      languages: [
        {
          language: String,
          proficiency: String,
        },
      ],
      totalExperienceYears: Number,
    },
    isParsed: {
      type: Boolean,
      default: false,
    },
    parseError: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure only one primary resume per user
resumeSchema.pre('save', async function (next) {
  if (this.isPrimary && this.isModified('isPrimary')) {
    // Unset other primary resumes for this user
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

// Virtual for formatted file size
resumeSchema.virtual('fileSizeFormatted').get(function () {
  if (!this.fileSize) return 'Unknown';
  const kb = this.fileSize / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
});

// Static method to get user's primary resume
resumeSchema.statics.getPrimaryResume = function (userId) {
  return this.findOne({ user: userId, isPrimary: true, isActive: true });
};

// Static method to get user's resumes
resumeSchema.statics.getUserResumes = function (userId) {
  return this.find({ user: userId, isActive: true }).sort({ createdAt: -1 });
};

// Instance method to set as primary
resumeSchema.methods.setAsPrimary = async function () {
  // Unset other primary resumes
  await this.constructor.updateMany(
    { user: this.user, _id: { $ne: this._id } },
    { isPrimary: false }
  );
  this.isPrimary = true;
  return this.save();
};

// Indexes
resumeSchema.index({ user: 1 });
resumeSchema.index({ user: 1, isPrimary: 1 });
resumeSchema.index({ 'parsedData.skills': 1 });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
