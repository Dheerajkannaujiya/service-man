const { createPaymentOrder, verifyAndCapturePayment } = require('../services/paymentService');

/**
 * Initiate payment order for a booking
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body;
    if (!bookingId || !amount) {
      return res.status(400).json({ success: false, message: 'Booking ID and amount are required.' });
    }

    const orderData = await createPaymentOrder(bookingId, req.user._id, Number(amount));
    res.json({ success: true, order: orderData });
  } catch (err) {
    next(err);
  }
};

/**
 * Verify and capture payment
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required.' });
    }

    const result = await verifyAndCapturePayment(paymentId, {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    res.json({
      success: true,
      message: 'Payment verified and captured successfully.',
      result
    });
  } catch (err) {
    next(err);
  }
};
