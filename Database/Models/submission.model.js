import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        selectedOptionIndex: {
          type: Number,
          required: true,
        },
        pointsEarned: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalScore: {
      type: Number,
      default: 0,
    },
    interpretation: {
      label: String,
      description: String,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false },
);

export const submissionModel = mongoose.model("Submission", submissionSchema);
