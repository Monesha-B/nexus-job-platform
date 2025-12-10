const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    coverLetter: {
      type: String,
      maxlength: [5000, 'Cover letter cannot exceed 5000 characters'],
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewed', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn', 'hired'],
        message: 'Invalid application status',
      },
      default: 'pending',
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    aiAnalysis: {
      matchPercentage: Number,
      overallFit: {
        type: String,
        enum: ['excellent', 'good', 'moderate', 'low'],
      },
      summary: String,
      strengths: [String],
      gaps: [String],
      recommendation: String,
      keyMatches: [
        {
          skill: String,
          level: String,
        },
      ],
      interviewQuestions: [
        {
          question: String,
          suggestedAnswer: String,
          tip: String,
        },
      ],
    },
    notes: [
      {
        content: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    statusHistory: [
      {
        status: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        note: String,
      },
    ],
    interviewSchedule: {
      date: Date,
      time: String,
      location: String,
      type: {
        type: String,
        enum: ['phone', 'video', 'onsite'],
      },
      interviewers: [String],
      notes: String,
    },
    withdrawalReason: String,
    rejectionReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Other indexes
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ matchScore: -1 });
applicationSchema.index({ createdAt: -1 });

// Pre-save to track status changes
applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

// Post-save to increment job application count
applicationSchema.post('save', async function (doc) {
  if (this.wasNew) {
    const Job = mongoose.model('Job');
    await Job.findByIdAndUpdate(doc.job, { $inc: { applicationsCount: 1 } });
  }
});

// Store if document was new
applicationSchema.pre('save', function (next) {
  this.wasNew = this.isNew;
  next();
});

// Virtual for days since application
applicationSchema.virtual('daysSinceApplication').get(function () {
  const now = new Date();
  const applied = new Date(this.createdAt);
  const diffTime = Math.abs(now - applied);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Static method to get applications for a job
applicationSchema.statics.getJobApplications = function (jobId, status = null) {
  const query = { job: jobId };
  if (status) query.status = status;
  return this.find(query)
    .populate('applicant', 'firstName lastName email avatar')
    .populate('resume')
    .sort({ matchScore: -1, createdAt: -1 });
};

// Static method to get user's applications
applicationSchema.statics.getUserApplications = function (userId, status = null) {
  const query = { applicant: userId };
  if (status) query.status = status;
  return this.find(query)
    .populate('job', 'title company location type')
    .populate('resume', 'fileName')
    .sort({ createdAt: -1 });
};

// Instance method to add note
applicationSchema.methods.addNote = async function (content, userId) {
  this.notes.push({
    content,
    addedBy: userId,
    addedAt: new Date(),
  });
  return this.save();
};

// Instance method to update status
applicationSchema.methods.updateStatus = async function (newStatus, userId, note = null) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy: userId,
    note,
  });
  return this.save();
};

// Instance method to withdraw
applicationSchema.methods.withdraw = async function (reason = null) {
  this.status = 'withdrawn';
  this.withdrawalReason = reason;
  return this.save();
};

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
