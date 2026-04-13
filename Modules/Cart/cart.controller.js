import { cartModel } from "../../Database/Models/cart.model.js";
import { testModel } from "../../Database/Models/test.model.js";
import { catchAsync } from "../../Utils/Error/catchAsync.js";
import { AppError } from "../../Utils/Error/AppError.js";

// --- Helpers ---

/**
 * Gets identifying information for the cart (userId for logged in users only)
 */
const getCartIdentifier = (req) => {
  const userId = req.user?._id || null;
  // const sessionId = !userId
  //   ? req.body?.sessionId || req.headers["x-session-id"] || null
  //   : null;
  const sessionId = null; // Disabled guest carts
  return { userId, sessionId };
};

// Finds an active cart based on userId or sessionId
const findCart = (userId, sessionId) => {
  if (!userId && !sessionId) return null;
  const query = userId
    ? { userId, isDeleted: false }
    : { sessionId, isDeleted: false };
  return cartModel.findOne(query);
};

/**
 * Recalculates the total price of the cart
 */
const recalcCart = async (cart) => {
  await cart.populate("items.testId");

  let totalPrice = 0;
  for (const item of cart.items) {
    if (!item.isDeleted && item.testId) {
      totalPrice += item.testId.price;
    }
  }
  cart.totalPrice = totalPrice;
  return cart;
};

// --- Controllers ---

// Adds a test to the cart
export const addToCart = catchAsync(async (req, res, next) => {
  const { testId } = req.body;
  const { userId, sessionId } = getCartIdentifier(req);

  if (!userId) return next(new AppError("Authentication required", 401));
  if (!testId) return next(new AppError("Test ID is required", 400));

  const test = await testModel.findById(testId);
  if (!test) return next(new AppError("Test not found", 404));

  let cart = await findCart(userId, sessionId);

  if (!cart) {
    cart = await cartModel.create({
      userId,
      // sessionId, // Disabled for guests
      items: [{ testId }],
    });
  } else {
    // Check if test already exists in cart items (and not soft-deleted)
    const existingItem = cart.items.find(
      (item) => item.testId.toString() === testId && !item.isDeleted,
    );

    if (existingItem) {
      return next(new AppError("Test is already in your cart", 400));
    }

    cart.items.push({ testId });
  }

  await recalcCart(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Test added to cart successfully",
    data: cart,
  });
});

/**
 * Gets the current cart details
 */
export const getCart = catchAsync(async (req, res, next) => {
  const { userId, sessionId } = getCartIdentifier(req);

  if (!userId) return next(new AppError("Authentication required", 401));

  const cart = await findCart(userId, sessionId);

  if (!cart) {
    return res.status(200).json({
      status: "success",
      data: { items: [], totalPrice: 0 },
    });
  }

  await cart.populate("items.testId");

  // Filter out soft-deleted items for the response
  const cartData = cart.toObject();
  cartData.items = cartData.items.filter((item) => !item.isDeleted);

  res.status(200).json({ status: "success", data: cartData });
});

/**
 * Removes a test from the cart
 */
export const removeFromCart = catchAsync(async (req, res, next) => {
  const { testId } = req.params;
  const { userId, sessionId } = getCartIdentifier(req);

  if (!userId) return next(new AppError("Authentication required", 401));

  const cart = await findCart(userId, sessionId);
  if (!cart) return next(new AppError("Cart not found", 404));

  const item = cart.items.find(
    (i) => i.testId.toString() === testId && !i.isDeleted,
  );
  if (!item) return next(new AppError("Test not found in cart", 404));

  // Soft delete the item
  item.isDeleted = true;

  await recalcCart(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Test removed from cart",
    data: cart,
  });
});

/**
 * Clears the entire cart
 */
export const clearCart = catchAsync(async (req, res, next) => {
  const { userId, sessionId } = getCartIdentifier(req);

  if (!userId) return next(new AppError("Authentication required", 401));

  const cart = await findCart(userId, sessionId);
  if (!cart) return next(new AppError("Cart not found", 404));

  cart.isDeleted = true;
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Cart cleared successfully",
  });
});

/**
 * Merges guest cart into user cart (usually called after login) - DISABLED
 */
// export const mergeGuestCart = async (userId, sessionId) => {
//   if (!sessionId) return;

//   const guestCart = await cartModel.findOne({ sessionId, isDeleted: false });
//   if (!guestCart) return;

//   let userCart = await cartModel.findOne({ userId, isDeleted: false });

//   if (userCart) {
//     for (const guestItem of guestCart.items) {
//       if (guestItem.isDeleted) continue;

//       const existingInUserCart = userCart.items.find(
//         (item) =>
//           item.testId.toString() === guestItem.testId.toString() &&
//           !item.isDeleted,
//       );

//       if (!existingInUserCart) {
//         userCart.items.push({ testId: guestItem.testId });
//       }
//     }

//     await recalcCart(userCart);
//     await userCart.save();

//     // Soft delete the guest cart after merging
//     guestCart.isDeleted = true;
//     await guestCart.save();
//   } else {
//     // Convert guest cart to user cart
//     guestCart.userId = userId;
//     guestCart.sessionId = null;
//     await guestCart.save();
//   }
// };
