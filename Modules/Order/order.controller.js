import { orderModel } from "../../Database/Models/order.model.js";
import { catchAsync } from "../../Utils/Error/catchAsync.js";
import { AppError } from "../../Utils/Error/AppError.js";
import { testModel } from "../../Database/Models/test.model.js";
import { cartModel } from "../../Database/Models/cart.model.js";
import { userModel } from "../../Database/Models/user.model.js";

// Stripe is not installed in this project; payment routes are disabled.
const stripe = null;

const getUserOrders = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { userId: req.user._id };

  const [orders, totalOrders] = await Promise.all([
    orderModel
      .find(filter)
      .populate({
        path: "orderItems.testId",
        select: "title price coverImage",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    orderModel.countDocuments(filter),
  ]);

  res.status(200).json({
    message: "Orders of this user",
    data: orders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
    totalOrders,
  });
});

const getOrderById = catchAsync(async (req, res, next) => {
  let orderId = req.params.id;
  const order = await orderModel.findOne({ _id: orderId }).populate({
    path: "orderItems.testId",
    select: "title price coverImage",
  });

  if (!order) {
    return next(new AppError("order not found", 404));
  }
  res.status(200).json({
    message: "Order with this id ",
    data: order,
  });
});

const addOrder = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { cartId } = req.body;

  // Find cart and validate
  const cart = await cartModel.findById(cartId).populate("items.testId");
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Prevent reusing a cart that already has an order
  if (cart.isDeleted) {
    return next(
      new AppError(
        "This cart already has a placed order. Please cancel the existing order or create a new cart.",
        400,
      ),
    );
  }

  // Block if user already has a pending unpaid order
  const existingPendingOrder = await orderModel.findOne({
    userId,
    status: "Pending",
    isPaid: false,
  });

  if (existingPendingOrder) {
    return next(
      new AppError(
        "You already have a pending order. Please complete payment or cancel it before placing a new order.",
        400,
      ),
    );
  }

  // Filter active items only
  const activeItems = cart.items.filter((item) => !item.isDeleted);
  if (activeItems.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }

  // Build order items and calculate total
  const orderItems = [];
  let totalOrderPrice = 0;

  for (const item of activeItems) {
    const test = item.testId;
    if (!test) {
      return next(
        new AppError(`test with id ${item.testId} is not found`, 404),
      );
    }

    totalOrderPrice += test.price;

    orderItems.push({
      testId: test._id,
      testTitle: test.title,
      testCoverImage:
        test.coverImage && test.coverImage.length > 0 ? test.coverImage[0] : "",
      price: test.price,
    });
  }

  // Create order
  const order = await orderModel.create({
    userId,
    cartId,
    orderItems,
    totalOrderPrice,
    status: "Pending",
  });

  // soft-delete the cart (can be restored if payment fails)
  cart.isDeleted = true;
  await cart.save();

  res.status(201).json({
    status: "success",
    message: "Order created successfully. Please complete payment.",
    data: order,
  });
});

const cancelOrder = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  const order = await orderModel.findById(orderId);

  if (!order) {
    return next(new AppError("order not found", 404));
  }

  // can only cancel unpaid pending orders
  if (order.isPaid) {
    return next(new AppError("Cannot cancel a paid order", 400));
  }

  // can only cancel if status is "Pending" (before payment)
  const cancellableStatuses = ["Pending"];

  if (!cancellableStatuses.includes(order.status)) {
    return next(
      new AppError(`Cannot cancel order with status: ${order.status}.`, 400),
    );
  }

  // update order status
  const updatedOrder = await orderModel.findByIdAndUpdate(
    orderId,
    {
      $set: {
        status: "Cancelled",
        cancelledAt: new Date(),
      },
    },
    {
      new: true,
    },
  );

  // restore the soft-deleted cart so user can retry
  if (order.cartId) {
    await cartModel.findByIdAndUpdate(order.cartId, { isDeleted: false });
  }

  res.status(200).json({
    message: "order cancelled successfully",
    data: updatedOrder,
  });
});

const updatePaidStatus = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const orderId = req.params.id;
  const order = await orderModel.findById(orderId);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (order.isPaid) {
    return next(new AppError("Order is already paid", 400));
  }
  // update payment info

  const updatedOrder = await orderModel.findOneAndUpdate(
    { _id: orderId, status: "Pending" },
    {
      $set: {
        isPaid: true,
        paidAt: new Date(),
        status: "Completed",
      },
    },
    {
      new: true,
    },
  );

  if (!updatedOrder) {
    return next(
      new AppError("Order must be in Pending status to be paid", 400),
    );
  }

  if (updatedOrder.cartId) {
    await cartModel.findByIdAndDelete(updatedOrder.cartId);
  }
  res.status(200).json({
    message: "order paid status updated",
    data: updatedOrder,
  });
});

// const createPaymentIntent = catchAsync(async (req, res, next) => {
//   const userId = req.user._id;
//   const orderId = req.params.id;

//   if (!stripe) {
//     return next(new AppError("Stripe secret key is not configured", 500));
//   }

//   const order = await orderModel.findById(orderId);

//   if (!order) {
//     return next(new AppError("Order not found", 404));
//   }

//   if (order.isPaid) {
//     return next(new AppError("Order is already paid", 400));
//   }

//   if (order.status !== "Pending") {
//     return next(new AppError("Only pending orders can start payment", 400));
//   }

//   const amount = Math.round(order.totalOrderPrice * 100);

//   const paymentIntent = await stripe.paymentIntents.create({
//     amount,
//     currency: "usd",
//     payment_method_types: ["card"],
//     metadata: {
//       orderId: order._id.toString(),
//       userId: order.userId.toString(),
//     },
//   });

//   res.status(200).json({
//     status: "success",
//     clientSecret: paymentIntent.client_secret,
//     paymentIntentId: paymentIntent.id,
//   });
// });

// const stripeWebhook = catchAsync(async (req, res, next) => {
//   const signature = req.headers["stripe-signature"];

//   if (!signature) {
//     return next(new AppError("Missing Stripe signature", 400));
//   }

//   if (!process.env.STRIPE_WEBHOOK_SECRET) {
//     return next(new AppError("Stripe webhook secret is not configured", 500));
//   }

//   if (!stripe) {
//     return next(new AppError("Stripe secret key is not configured", 500));
//   }

//   const event = stripe.webhooks.constructEvent(
//     req.body,
//     signature,
//     process.env.STRIPE_WEBHOOK_SECRET,
//   );

//   if (event.type === "payment_intent.succeeded") {
//     const paymentIntent = event.data.object;
//     const orderId = paymentIntent.metadata?.orderId;

//     if (orderId) {
//       const order = await orderModel.findById(orderId);

//       if (order && !order.isPaid) {
//         order.isPaid = true;
//         order.paidAt = new Date();
//         order.status = "Completed";
//         await order.save();

//         if (order.cartId) {
//           await cartModel.findByIdAndDelete(order.cartId);
//         }
//       }
//     }
//   }

//   res.status(200).json({ received: true });
// });

// const confirmPayment = catchAsync(async (req, res, next) => {
//   const userId = req.user._id;
//   const orderId = req.params.id;
//   const { paymentIntentId } = req.body;

//   if (!stripe) {
//     return next(new AppError("Stripe secret key is not configured", 500));
//   }

//   if (!paymentIntentId) {
//     return next(new AppError("paymentIntentId is required", 400));
//   }

//   const order = await orderModel.findById(orderId);

//   if (!order) {
//     return next(new AppError("Order not found", 404));
//   }

//   if (order.isPaid) {
//     return next(new AppError("Order is already paid", 400));
//   }

//   if (order.status !== "Pending") {
//     return next(new AppError("Only pending orders can be confirmed", 400));
//   }

//   const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//   if (paymentIntent.metadata?.orderId !== orderId) {
//     return next(new AppError("PaymentIntent does not match this order", 400));
//   }

//   if (paymentIntent.status !== "succeeded") {
//     return next(
//       new AppError(
//         `Payment not completed. Current status: ${paymentIntent.status}`,
//         400,
//       ),
//     );
//   }

//   order.isPaid = true;
//   order.paidAt = new Date();
//   order.status = "Completed";
//   await order.save();

//   if (order.cartId) {
//     await cartModel.findByIdAndDelete(order.cartId);
//   }

//   res.status(200).json({
//     status: "success",
//     message: "Payment confirmed successfully",
//     data: {
//       orderId: order._id,
//       isPaid: order.isPaid,
//       status: order.status,
//       paidAt: order.paidAt,
//     },
//   });
// });

export {
  addOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updatePaidStatus,
  // createPaymentIntent,
  // confirmPayment,
  // stripeWebhook
};
