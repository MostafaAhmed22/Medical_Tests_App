
import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  coverImage: {
    type: String,
    default: null
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  interpretations: [
    {
      label: {
        type: String,
        required: true     // e.g. "Severe Anxiety"
      },
      minScore: {
        type: Number,
        required: true
      },
      maxScore: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        required: true     // full explanation shown to user after test
      }
    }
  ],
  isPublished: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

export const testModel = mongoose.model("Test", testSchema);