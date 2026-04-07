import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true, timestamps: true, versionKey: false },
);

const cartSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for guest carts
    },
    sessionId: {
      type: String,
      default: null, // for guest identification
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
      min: [0, "Total price cannot be negative"],
    },
    finalPrice: {
      type: Number,
      default: 0,
      min: [0, "Final price cannot be negative"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);


// each user can have only one active cart, and each session can have only one active cart (for guests)
// they can have multiple carts if they are deleted (soft delete) -- this allows for cart history and recovery if needed

// Ensure one active cart per user or session (sparse index to allow null values)
cartSchema.index(
  { userId: 1, isDeleted: 1 }, // Acs order (i can remove it)
  {
    unique: true,
    partialFilterExpression: {
      userId: { $ne: null },
      isDeleted: false,
    },
  },
);

cartSchema.index(
  { sessionId: 1, isDeleted: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sessionId: { $ne: null },
      isDeleted: false,
    },
  },
);

export const cartModel = mongoose.model("Cart", cartSchema);
