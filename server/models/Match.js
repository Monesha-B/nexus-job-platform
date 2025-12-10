const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    resumeText: {
      type: String,
      required: [true, 'Resume text is required for matching'],
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required for matching'],
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    result: {
      matchScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      overallFit: {
        type: String,
        enum: ['excellent', 'good', 'moderate', 'low'],
      },
      summary: {
        type: String,
      },
      strengths: [
        {
          type: String,
        },
      ],
      gaps: [
        {
          type: String,
        },
      ],
      skillsMatch: [
        {
          skill: String,
          status: {
            type: String,
            enum: ['match', 'partial', 'missing'],
          },
          importance: {
            type: String,
            enum: ['required', 'preferred', 'nice-to-have'],
          },
        },
      ],
      experienceMatch: {
        yearsRequired: Number,
        yearsActual: Number,
        assessment: String,
      },
      educationMatch: {
        required: String,
        actual: String,
        assessment: String,
      },
      recommendations: [
        {
          type: String,
        },
      ],
      interviewQuestions: [
        {
          question: String,
          category: {
            type: String,
            enum: ['behavioral', 'technical', 'situational', 'experience'],
          },
          suggestedAnswer: String,
          tip: String,
        },
      ],
      coverLetter: {
        type: String,
      },
    },
    processingTime: {
      type: Number, // in milliseconds
    },
    modelUsed: {
      type: String,
      default: 'claude-3-5-sonnet-20241022',
    },
    isSaved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
matchSchema.index({ user: 1, createdAt: -1 });
matchSchema.index({ 'result.matchScore': -1 });
matchSchema.index({ isSaved: 1 });

// Virtual for match quality label
matchSchema.virtual('matchQuality').get(function () {
  const score = this.result?.matchScore;
  if (!score) return 'unknown';
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'moderate';
  return 'low';
});

// Static method to get user's recent matches
matchSchema.statics.getUserMatches = function (userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get saved matches
matchSchema.statics.getSavedMatches = function (userId) {
  return this.find({ user: userId, isSaved: true }).sort({ createdAt: -1 });
};

// Instance method to save/unsave match
matchSchema.methods.toggleSave = async function () {
  this.isSaved = !this.isSaved;
  return this.save();
};

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
