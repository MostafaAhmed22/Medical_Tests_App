import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    orderItems: [
      {
        testId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Test",
          required: true,
        },
        testTitle: {
          type: String,
          required: true,
        },
        testCoverImage: String,
        price: {
          type: Number,
          required: true,
        }
      }
    ],
    totalOrderPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "Card"
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
    cancelledAt: Date,
  },
  {
    timestamps: true,
  },
);

orderSchema.index({
  createdAt: -1,
});

orderSchema.index({
  status: 1,
});

export const orderModel = mongoose.model("Order", orderSchema);
