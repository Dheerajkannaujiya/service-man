import api from './api';

/**
 * Ensures Razorpay Checkout SDK script is loaded in window
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Triggers full Razorpay payment checkout flow for a customer booking
 *
 * @param {Object} options
 * @param {Object} options.booking - The booking object (_id, bookingNumber, finalPrice, estimatedPrice)
 * @param {Object} options.user - Logged in user info (name, email, phone)
 * @param {Function} options.onSuccess - Callback when payment is captured and verified
 * @param {Function} options.onError - Callback on payment error
 * @param {boolean} [options.forceSimulation=false] - Force fast test simulation mode
 */
export const processRazorpayPayment = async ({
  booking,
  user,
  onSuccess,
  onError,
  forceSimulation = false
}) => {
  try {
    const amount = Number(booking.finalPrice || booking.estimatedPrice || 499);

    // 1. Create order on the server
    const orderRes = await api.post('/payments/create-order', {
      bookingId: booking._id,
      amount
    });

    if (!orderRes.data?.success) {
      throw new Error(orderRes.data?.message || 'Could not initialize payment order');
    }

    const orderData = orderRes.data.order;
    const keyId =
      orderData.keyId ||
      import.meta.env.VITE_RAZORPAY_KEY_ID ||
      '';

    const isRealKey =
      keyId &&
      !keyId.includes('serviceman2026') &&
      keyId.startsWith('rzp_');

    const isRealOrder =
      orderData.razorpayOrderId &&
      !orderData.razorpayOrderId.startsWith('order_sim_');

    // 2. Load Razorpay SDK
    const isScriptLoaded = await loadRazorpayScript();

    // 3. Open official Razorpay Checkout modal if valid credentials are present
    if (!forceSimulation && isScriptLoaded && window.Razorpay && isRealKey && isRealOrder) {
      return new Promise((resolve) => {
        const rzpOptions = {
          key: keyId,
          amount: Math.round(orderData.amount * 100),
          currency: orderData.currency || 'INR',
          name: 'ServiceMan Marketplace',
          description: `Payment for Booking #${booking.bookingNumber || (booking._id ? booking._id.slice(-6) : 'ORD')}`,
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=128&q=80',
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: user?.name || 'Customer',
            email: user?.email || 'customer@serviceman.com',
            contact: user?.phone || '+919876543210'
          },
          theme: {
            color: '#4f46e5'
          },
          handler: async function (response) {
            try {
              const verifyRes = await api.post('/payments/verify', {
                paymentId: orderData.paymentId,
                razorpayOrderId: response.razorpay_order_id || orderData.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });

              if (verifyRes.data?.success) {
                if (onSuccess) onSuccess(verifyRes.data);
                resolve({ success: true, verified: true, data: verifyRes.data });
              } else {
                throw new Error(verifyRes.data?.message || 'Payment verification failed');
              }
            } catch (vErr) {
              const msg = vErr.response?.data?.message || vErr.message;
              if (onError) onError(new Error(msg));
              resolve({ success: false, error: msg });
            }
          },
          modal: {
            ondismiss: function () {
              if (onError) onError(new Error('Payment checkout was closed by user'));
              resolve({ success: false, dismissed: true });
            }
          }
        };

        const rzpInstance = new window.Razorpay(rzpOptions);
        rzpInstance.on('payment.failed', function (resp) {
          const errMsg = resp.error?.description || 'Payment transaction failed';
          if (onError) onError(new Error(errMsg));
          resolve({ success: false, error: errMsg });
        });
        rzpInstance.open();
      });
    }

    // 4. Sandbox Simulation Fallback (runs if keys are placeholder or for fast testing)
    const verifyRes = await api.post('/payments/verify', {
      paymentId: orderData.paymentId || `pay_${Date.now()}`,
      razorpayOrderId: orderData.razorpayOrderId || `order_${Date.now()}`,
      razorpayPaymentId: `pay_test_${Date.now()}`,
      razorpaySignature: 'simulated_valid_signature'
    });

    if (verifyRes.data?.success) {
      if (onSuccess) onSuccess(verifyRes.data);
      return { success: true, simulated: true, data: verifyRes.data };
    } else {
      throw new Error(verifyRes.data?.message || 'Sandbox verification failed');
    }
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message;
    if (onError) onError(new Error(errorMsg));
    return { success: false, error: errorMsg };
  }
};
