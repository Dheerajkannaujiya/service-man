import {
  INITIAL_SERVICES,
  MOCK_USERS,
  MOCK_PROVIDER_PROFILE,
  MOCK_NEARBY_PROVIDERS,
  INITIAL_BOOKING,
  INITIAL_COMPLETED_BOOKINGS,
  INITIAL_KYC_DOCUMENTS,
  INITIAL_COMPLAINTS,
  INITIAL_AI_REVIEWS,
  MOCK_ANALYTICS_DATA,
  MOCK_AUDIT_LOGS
} from './mockData';

// Storage keys
const STORAGE_PREFIX = 'serviceman_mock_';
const getItem = (key, defaultVal) => {
  try {
    const val = localStorage.getItem(STORAGE_PREFIX + key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};
const setItem = (key, val) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (e) {}
};

// Event emitter for simulated real-time events across windows / components
export const mockEventBus = {
  listeners: {},
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  },
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  },
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error('[MockEventBus Error]', e);
        }
      });
    }
  }
};

// Initialize default state
export const initMockStore = () => {
  if (!localStorage.getItem(STORAGE_PREFIX + 'services')) {
    setItem('services', INITIAL_SERVICES);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'active_booking')) {
    setItem('active_booking', INITIAL_BOOKING);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'bookings_history')) {
    setItem('bookings_history', INITIAL_COMPLETED_BOOKINGS);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'kyc_documents')) {
    setItem('kyc_documents', INITIAL_KYC_DOCUMENTS);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'complaints')) {
    setItem('complaints', INITIAL_COMPLAINTS);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'ai_reviews')) {
    setItem('ai_reviews', INITIAL_AI_REVIEWS);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'provider_profile')) {
    setItem('provider_profile', MOCK_PROVIDER_PROFILE);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'chat_messages')) {
    setItem('chat_messages', [
      {
        _id: 'msg_01',
        bookingId: INITIAL_BOOKING._id,
        senderId: MOCK_USERS.provider,
        content: 'Hello Rahul! I have accepted your roadside request. I am en route with battery diagnostic equipment.',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        isRead: true
      }
    ]);
  }
};

export const resetMockStore = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX) || key.startsWith('serviceman_')) {
        localStorage.removeItem(key);
      }
    });
    initMockStore();
  } catch (e) {
    console.error('Failed to reset mock store', e);
  }
};

// Call once on module load
initMockStore();

// Mock Request Handler
export const handleMockRequest = async (config) => {
  const { url, method = 'get', data } = config;
  const parsedData = typeof data === 'string' ? JSON.parse(data || '{}') : (data || {});
  const cleanUrl = url.replace(/^\/api\/?/, '/').replace(/\/+$/, '');

  // Simulate ultra-responsive network latency
  await new Promise((r) => setTimeout(r, 120));

  console.log(`[Mock API] Intercepted ${method.toUpperCase()} ${cleanUrl}`, parsedData);

  // AUTH ROUTES
  if (cleanUrl === '/auth/login' && method.toLowerCase() === 'post') {
    const { emailOrPhone = '' } = parsedData;
    const lower = emailOrPhone.toLowerCase();

    let matchedUser = MOCK_USERS.customer;
    if (lower.includes('admin')) matchedUser = MOCK_USERS.admin;
    else if (lower.includes('electrician')) matchedUser = MOCK_USERS.electrician;
    else if (lower.includes('provider') || lower.includes('mechanic')) matchedUser = MOCK_USERS.provider;

    const token = `mock_jwt_token_${matchedUser.role}_${Date.now()}`;
    return {
      status: 200,
      data: {
        success: true,
        message: 'Login successful (Interactive Mode)',
        token,
        user: matchedUser
      }
    };
  }

  if (cleanUrl === '/auth/register' && method.toLowerCase() === 'post') {
    const newUser = {
      id: `user_${Date.now()}`,
      _id: `user_${Date.now()}`,
      name: parsedData.name || 'New Member',
      email: parsedData.email || 'user@serviceman.com',
      phone: parsedData.phone || '+919876543210',
      role: parsedData.role || 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      city: parsedData.city || 'Noida',
      address: parsedData.address || 'Sector 18, Noida',
      location: { type: 'Point', coordinates: [77.3736, 28.5204] },
      warningCount: 0
    };
    return {
      status: 201,
      data: {
        success: true,
        message: 'Registration successful (Interactive Mode)',
        token: `mock_jwt_token_${newUser.role}_${Date.now()}`,
        user: newUser
      }
    };
  }

  if (cleanUrl === '/auth/me') {
    const storedUser = localStorage.getItem('serviceman_user');
    const user = storedUser ? JSON.parse(storedUser) : MOCK_USERS.customer;
    return {
      status: 200,
      data: {
        success: true,
        user
      }
    };
  }

  // SERVICES
  if (cleanUrl === '/customer/services') {
    const services = getItem('services', INITIAL_SERVICES);
    return {
      status: 200,
      data: {
        success: true,
        services,
        count: services.length
      }
    };
  }

  // NEARBY PROVIDERS
  if (cleanUrl === '/customer/nearby-providers') {
    return {
      status: 200,
      data: {
        success: true,
        providers: MOCK_NEARBY_PROVIDERS
      }
    };
  }

  // CUSTOMER ACTIVE BOOKING
  if (cleanUrl === '/customer/active-booking') {
    const activeBooking = getItem('active_booking', INITIAL_BOOKING);
    return {
      status: 200,
      data: {
        success: true,
        hasActiveBooking: !!activeBooking,
        booking: activeBooking
      }
    };
  }

  // CUSTOMER REQUEST SERVICE
  if (cleanUrl === '/customer/request-service' && method.toLowerCase() === 'post') {
    const services = getItem('services', INITIAL_SERVICES);
    const selectedService = services.find((s) => s._id === parsedData.serviceId) || services[0];

    const newBooking = {
      _id: `bk_${Date.now()}`,
      bookingNumber: `SM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: MOCK_USERS.customer,
      providerId: MOCK_USERS.provider,
      serviceId: selectedService,
      status: 'ACCEPTED',
      problemDescription: parsedData.problemDescription || 'Urgent assistance requested.',
      address: parsedData.address || 'Sector 128, Noida',
      city: parsedData.city || 'Noida',
      customerLocation: { type: 'Point', coordinates: [77.3736, 28.5204] },
      providerLiveLocation: { type: 'Point', coordinates: [77.3450, 28.5450] },
      estimatedPrice: selectedService.basePrice,
      finalPrice: selectedService.basePrice,
      paymentStatus: 'pending',
      paymentMethod: 'razorpay',
      startOtp: String(Math.floor(1000 + Math.random() * 9000)),
      urgency: parsedData.urgency || 'standard',
      createdAt: new Date().toISOString(),
      providerProfile: {
        rating: 4.9,
        trustScore: 92,
        hasTrustBadge: true,
        hourlyRate: 399
      }
    };

    setItem('active_booking', newBooking);

    // Trigger real-time notifications
    mockEventBus.emit('booking:accepted', newBooking);
    mockEventBus.emit('booking:status_update', newBooking);

    return {
      status: 201,
      data: {
        success: true,
        message: 'Service request created. Provider Vikram Singh accepted dispatch.',
        matchedCount: 3,
        booking: newBooking
      }
    };
  }

  // CUSTOMER BOOKINGS LIST
  if (cleanUrl === '/customer/bookings') {
    const history = getItem('bookings_history', INITIAL_COMPLETED_BOOKINGS);
    const active = getItem('active_booking', null);
    const all = active ? [active, ...history] : history;
    return {
      status: 200,
      data: {
        success: true,
        bookings: all
      }
    };
  }

  // PROVIDER PROFILE
  if (cleanUrl === '/provider/profile') {
    const profile = getItem('provider_profile', MOCK_PROVIDER_PROFILE);
    return {
      status: 200,
      data: {
        success: true,
        provider: profile
      }
    };
  }

  // PROVIDER ACTIVE BOOKING
  if (cleanUrl === '/provider/active-booking') {
    const activeBooking = getItem('active_booking', INITIAL_BOOKING);
    return {
      status: 200,
      data: {
        success: true,
        hasActiveBooking: !!activeBooking,
        booking: activeBooking
      }
    };
  }

  // PROVIDER INCOMING REQUESTS
  if (cleanUrl === '/provider/requests') {
    return {
      status: 200,
      data: {
        success: true,
        requests: [
          {
            _id: 'req_dispatch_01',
            serviceId: INITIAL_SERVICES[0],
            category: 'Mechanic',
            problemDescription: 'Vehicle broken down near Wave City Metro. Engine clicking.',
            address: 'Sector 32, Noida',
            city: 'Noida',
            distanceKm: '2.4',
            etaMinutes: '8'
          }
        ]
      }
    };
  }

  // PROVIDER ACCEPT REQUEST
  if (cleanUrl.match(/\/provider\/requests\/[^/]+\/accept/) && method.toLowerCase() === 'post') {
    const activeBooking = getItem('active_booking', INITIAL_BOOKING);
    return {
      status: 200,
      data: {
        success: true,
        booking: activeBooking
      }
    };
  }

  // PROVIDER TOGGLE AVAILABILITY
  if (cleanUrl === '/provider/availability' && method.toLowerCase() === 'put') {
    const profile = getItem('provider_profile', MOCK_PROVIDER_PROFILE);
    profile.isOnline = parsedData.isOnline !== undefined ? parsedData.isOnline : !profile.isOnline;
    setItem('provider_profile', profile);
    return {
      status: 200,
      data: {
        success: true,
        isOnline: profile.isOnline
      }
    };
  }

  // PROVIDER STATUS UPDATE STEPPER
  if (cleanUrl.match(/\/provider\/bookings\/[^/]+\/status/) && method.toLowerCase() === 'put') {
    let activeBooking = getItem('active_booking', INITIAL_BOOKING);
    const { status, startOtp } = parsedData;

    if (!activeBooking) {
      activeBooking = INITIAL_BOOKING;
    }

    if (status === 'SERVICE_STARTED') {
      if (startOtp && startOtp !== activeBooking.startOtp && startOtp !== '7294') {
        return {
          status: 400,
          data: {
            success: false,
            message: 'Invalid 4-digit start OTP provided by customer.'
          }
        };
      }
    }

    activeBooking.status = status;

    if (status === 'SERVICE_COMPLETED') {
      // Add earnings
      const profile = getItem('provider_profile', MOCK_PROVIDER_PROFILE);
      const earned = activeBooking.finalPrice || activeBooking.estimatedPrice || 499;
      profile.totalEarnings = (profile.totalEarnings || 0) + Math.round(earned * 0.85);
      profile.pendingPayout = (profile.pendingPayout || 0) + Math.round(earned * 0.85);
      setItem('provider_profile', profile);

      // Move to completed bookings history
      const history = getItem('bookings_history', INITIAL_COMPLETED_BOOKINGS);
      history.unshift({ ...activeBooking, paymentStatus: 'completed' });
      setItem('bookings_history', history);
    }

    setItem('active_booking', activeBooking);
    mockEventBus.emit('booking:status_update', activeBooking);

    return {
      status: 200,
      data: {
        success: true,
        booking: activeBooking
      }
    };
  }

  // PROVIDER EARNINGS
  if (cleanUrl === '/provider/earnings') {
    const profile = getItem('provider_profile', MOCK_PROVIDER_PROFILE);
    return {
      status: 200,
      data: {
        success: true,
        totalEarnings: profile.totalEarnings || 18450,
        pendingPayout: profile.pendingPayout || 3120,
        completedJobs: 48,
        recentPayments: [
          {
            _id: 'pay_01',
            razorpayPaymentId: 'pay_SM_9921',
            amount: 499,
            platformFee: 75,
            providerEarnings: 424,
            status: 'transferred',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'pay_02',
            razorpayPaymentId: 'pay_SM_8810',
            amount: 799,
            platformFee: 120,
            providerEarnings: 679,
            status: 'transferred',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      }
    };
  }

  // PROVIDER REVIEWS
  if (cleanUrl === '/provider/reviews') {
    const reviews = getItem('ai_reviews', INITIAL_AI_REVIEWS);
    return {
      status: 200,
      data: {
        success: true,
        reviews,
        count: reviews.length,
        ratingAverage: 4.9,
        trustScore: 92,
        hasTrustBadge: true
      }
    };
  }

  // SUBMIT REVIEW
  if (cleanUrl.match(/\/reviews\/booking\/[^/]+/) && method.toLowerCase() === 'post') {
    const { rating = 5, comment = '' } = parsedData;

    // AI sentiment NLP calculation
    const positiveWords = ['great', 'fast', 'good', 'rain', 'excellent', 'quick', 'helped', 'polite', 'best', 'super'];
    const lowerComment = comment.toLowerCase();
    const hasPositive = positiveWords.some((w) => lowerComment.includes(w));
    const isNegative = lowerComment.includes('bad') || lowerComment.includes('worst') || lowerComment.includes('scam') || lowerComment.includes('late');

    const sentimentLabel = isNegative ? 'negative' : (hasPositive || rating >= 4 ? 'positive' : 'neutral');
    const sentimentScore = sentimentLabel === 'positive' ? 0.95 : (sentimentLabel === 'negative' ? 0.88 : 0.65);
    const trustScoreDelta = sentimentLabel === 'positive' ? 4 : (sentimentLabel === 'negative' ? -5 : 1);

    const newReview = {
      _id: `rev_${Date.now()}`,
      authorId: MOCK_USERS.customer,
      recipientId: MOCK_USERS.provider,
      rating,
      comment,
      analysis: {
        sentimentLabel,
        sentimentScore,
        trustScoreDelta,
        fraudScore: 6,
        abusiveLanguageDetected: false
      },
      createdAt: new Date().toISOString()
    };

    const reviews = getItem('ai_reviews', INITIAL_AI_REVIEWS);
    reviews.unshift(newReview);
    setItem('ai_reviews', reviews);

    return {
      status: 201,
      data: {
        success: true,
        message: 'Review evaluated and published.',
        review: newReview,
        analysis: newReview.analysis
      }
    };
  }

  // KYC DOCUMENTS
  if (cleanUrl === '/kyc/my-documents') {
    const docs = getItem('kyc_documents', INITIAL_KYC_DOCUMENTS);
    return {
      status: 200,
      data: {
        success: true,
        documents: docs,
        kycStatus: 'verified',
        rejectionReason: ''
      }
    };
  }

  if (cleanUrl === '/kyc/upload' && method.toLowerCase() === 'post') {
    const docs = getItem('kyc_documents', INITIAL_KYC_DOCUMENTS);
    const newDoc = {
      _id: `kyc_doc_${Date.now()}`,
      providerId: {
        _id: 'user_prov_1',
        name: 'Vikram Singh',
        phone: '+919812345678',
        city: 'Noida'
      },
      documentType: 'aadhaar',
      documentNumber: '•••• •••• 9920',
      fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    docs.unshift(newDoc);
    setItem('kyc_documents', docs);

    return {
      status: 201,
      data: {
        success: true,
        message: 'Document uploaded for admin review.',
        document: newDoc
      }
    };
  }

  if (cleanUrl === '/kyc/pending') {
    const docs = getItem('kyc_documents', INITIAL_KYC_DOCUMENTS);
    return {
      status: 200,
      data: {
        success: true,
        documents: docs.filter((d) => d.status === 'pending' || d.status === 'verified')
      }
    };
  }

  if (cleanUrl.match(/\/kyc\/review\/[^/]+/) && method.toLowerCase() === 'put') {
    const docId = cleanUrl.split('/').pop();
    const docs = getItem('kyc_documents', INITIAL_KYC_DOCUMENTS);
    const target = docs.find((d) => d._id === docId);
    if (target) {
      target.status = parsedData.status || 'verified';
      target.rejectionReason = parsedData.rejectionReason || '';
      setItem('kyc_documents', docs);
    }
    return {
      status: 200,
      data: {
        success: true,
        message: `KYC Document marked as ${parsedData.status || 'verified'}`
      }
    };
  }

  // ADMIN DASHBOARD & STATS
  if (cleanUrl === '/admin/dashboard') {
    return {
      status: 200,
      data: {
        success: true,
        stats: {
          totalCustomers: 1788,
          totalProviders: 354,
          verifiedProviders: 326,
          pendingKyc: 3,
          activeBookings: 18,
          completedBookings: 4620,
          platformRevenue: '3,84,500',
          openComplaints: 1
        }
      }
    };
  }

  // ADMIN BOOKINGS
  if (cleanUrl.startsWith('/admin/bookings')) {
    const history = getItem('bookings_history', INITIAL_COMPLETED_BOOKINGS);
    const active = getItem('active_booking', INITIAL_BOOKING);
    return {
      status: 200,
      data: {
        success: true,
        bookings: [active, ...history]
      }
    };
  }

  // ADMIN PROVIDERS DIRECTORY
  if (cleanUrl.startsWith('/admin/providers')) {
    return {
      status: 200,
      data: {
        success: true,
        providers: [
          {
            _id: 'prov_p1',
            user: MOCK_USERS.provider,
            categories: ['Mechanic'],
            experienceYears: 8,
            qualification: 'ITI Certified Automobile Master',
            hourlyRate: 399,
            ratingAverage: 4.9,
            ratingCount: 64,
            trustScore: 92,
            hasTrustBadge: true,
            isOnline: true,
            kycStatus: 'verified'
          },
          {
            _id: 'prov_p2',
            user: MOCK_USERS.electrician,
            categories: ['Electrician'],
            experienceYears: 6,
            qualification: 'Govt. Licensed Electrical Contractor',
            hourlyRate: 299,
            ratingAverage: 4.7,
            ratingCount: 39,
            trustScore: 81,
            hasTrustBadge: true,
            isOnline: true,
            kycStatus: 'verified'
          }
        ]
      }
    };
  }

  // ADMIN COMPLAINTS
  if (cleanUrl === '/admin/complaints') {
    const complaints = getItem('complaints', INITIAL_COMPLAINTS);
    return {
      status: 200,
      data: {
        success: true,
        complaints
      }
    };
  }

  if (cleanUrl.match(/\/admin\/complaints\/[^/]+\/resolve/) && method.toLowerCase() === 'put') {
    const compId = cleanUrl.split('/')[3];
    const complaints = getItem('complaints', INITIAL_COMPLAINTS);
    const target = complaints.find((c) => c._id === compId);
    if (target) {
      target.status = 'resolved';
      target.resolutionAction = parsedData.actionTaken || 'warning_issued';
      target.adminNotes = parsedData.adminNotes || '';
      setItem('complaints', complaints);
    }
    return {
      status: 200,
      data: {
        success: true,
        message: 'Complaint resolved and penalty action recorded.'
      }
    };
  }

  // ADMIN AI REVIEWS
  if (cleanUrl === '/admin/reviews-ai') {
    const reviews = getItem('ai_reviews', INITIAL_AI_REVIEWS);
    return {
      status: 200,
      data: {
        success: true,
        reviews,
        flaggedCount: reviews.filter((r) => r.isFlagged || r.analysis?.fraudScore >= 40).length
      }
    };
  }

  // ADMIN ANALYTICS
  if (cleanUrl === '/admin/analytics') {
    return {
      status: 200,
      data: {
        success: true,
        analytics: MOCK_ANALYTICS_DATA
      }
    };
  }

  // ADMIN AUDIT LOGS
  if (cleanUrl === '/admin/audit-logs') {
    return {
      status: 200,
      data: {
        success: true,
        logs: MOCK_AUDIT_LOGS
      }
    };
  }

  // CHAT ROUTES
  if (cleanUrl.match(/\/chat\/[^/]+/) && method.toLowerCase() === 'get') {
    const bookingId = cleanUrl.split('/').pop();
    const all = getItem('chat_messages', []);
    const filtered = all.filter((m) => m.bookingId === bookingId);
    return {
      status: 200,
      data: {
        success: true,
        messages: filtered
      }
    };
  }

  if (cleanUrl.match(/\/chat\/[^/]+/) && method.toLowerCase() === 'post') {
    const bookingId = cleanUrl.split('/').pop();
    const storedUser = localStorage.getItem('serviceman_user');
    const user = storedUser ? JSON.parse(storedUser) : MOCK_USERS.customer;

    const newMsg = {
      _id: `msg_${Date.now()}`,
      bookingId,
      senderId: user,
      content: parsedData.content || '',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    const all = getItem('chat_messages', []);
    all.push(newMsg);
    setItem('chat_messages', all);

    mockEventBus.emit('chat:new_message', newMsg);

    // Simulate smart technician auto-reply after 2 seconds if customer sends a message
    if (user.role === 'customer') {
      setTimeout(() => {
        const autoReply = {
          _id: `msg_rep_${Date.now()}`,
          bookingId,
          senderId: MOCK_USERS.provider,
          content: 'Got it! I am just 5 minutes away, approaching your main entrance.',
          createdAt: new Date().toISOString(),
          isRead: false
        };
        const currentMessages = getItem('chat_messages', []);
        currentMessages.push(autoReply);
        setItem('chat_messages', currentMessages);
        mockEventBus.emit('chat:new_message', autoReply);
      }, 2000);
    }

    return {
      status: 201,
      data: {
        success: true,
        message: newMsg
      }
    };
  }

  // PAYMENTS (RAZORPAY SIMULATION)
  if (cleanUrl === '/payments/create-order' && method.toLowerCase() === 'post') {
    return {
      status: 200,
      data: {
        success: true,
        order: {
          razorpayOrderId: `order_${Date.now()}`,
          paymentId: `pay_${Date.now()}`,
          amount: parsedData.amount || 499,
          currency: 'INR'
        }
      }
    };
  }

  if (cleanUrl === '/payments/verify' && method.toLowerCase() === 'post') {
    const activeBooking = getItem('active_booking', INITIAL_BOOKING);
    if (activeBooking) {
      activeBooking.paymentStatus = 'completed';
      setItem('active_booking', activeBooking);
    }
    return {
      status: 200,
      data: {
        success: true,
        message: 'Payment verified and settled successfully.'
      }
    };
  }

  // NOTIFICATIONS
  if (cleanUrl === '/notifications') {
    return {
      status: 200,
      data: {
        success: true,
        notifications: [
          {
            _id: 'notif_1',
            title: 'Technician Assigned',
            message: 'Vikram Singh (4.9 Rating) accepted your roadside assistance request.',
            type: 'booking_accepted',
            isRead: false,
            createdAt: new Date().toISOString()
          },
          {
            _id: 'notif_2',
            title: 'Welcome to ServiceMan',
            message: 'Your account is verified and ready for seamless on-demand dispatches.',
            type: 'general',
            isRead: true,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      }
    };
  }

  // Default fallback for any unmatched route
  return {
    status: 200,
    data: {
      success: true,
      message: 'OK (Mock Fallback)'
    }
  };
};
