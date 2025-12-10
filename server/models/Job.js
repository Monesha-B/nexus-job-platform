const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    locationType: {
      type: String,
      enum: ['onsite', 'remote', 'hybrid'],
      default: 'onsite',
    },
    type: {
      type: String,
      enum: {
        values: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
        message: 'Invalid job type',
      },
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid',
    },
    salary: {
      min: {
        type: Number,
        min: [0, 'Salary cannot be negative'],
      },
      max: {
        type: Number,
        min: [0, 'Salary cannot be negative'],
      },
      currency: {
        type: String,
        default: 'USD',
      },
      period: {
        type: String,
        enum: ['hourly', 'monthly', 'yearly'],
        default: 'yearly',
      },
      isVisible: {
        type: Boolean,
        default: true,
      },
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    benefits: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    applicationUrl: {
      type: String,
      trim: true,
    },
    applicationEmail: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for applications
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job',
});

// Virtual to check if job is expired
jobSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for formatted salary
jobSchema.virtual('salaryDisplay').get(function () {
  if (!this.salary || !this.salary.isVisible) return 'Not disclosed';
  if (this.salary.min && this.salary.max) {
    return `${this.salary.currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()} ${this.salary.period}`;
  }
  if (this.salary.min) {
    return `${this.salary.currency} ${this.salary.min.toLocaleString()}+ ${this.salary.period}`;
  }
  return 'Not disclosed';
});

// Pre-save middleware
jobSchema.pre('save', function (next) {
  // Validate salary range
  if (this.salary && this.salary.min && this.salary.max) {
    if (this.salary.min > this.salary.max) {
      next(new Error('Minimum salary cannot be greater than maximum salary'));
    }
  }
  next();
});

// Static method to get active jobs
jobSchema.statics.getActiveJobs = function (filters = {}) {
  return this.find({
    isActive: true,
    $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
    ...filters,
  }).sort({ postedAt: -1 });
};

// Instance method to increment views
jobSchema.methods.incrementViews = async function () {
  this.viewsCount += 1;
  return this.save();
};

// Instance method to increment applications
jobSchema.methods.incrementApplications = async function () {
  this.applicationsCount += 1;
  return this.save();
};

// Indexes for search and filtering
jobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ isActive: 1, postedAt: -1 });
jobSchema.index({ recruiter: 1 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
