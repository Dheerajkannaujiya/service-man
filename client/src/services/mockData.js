// ServiceMan Comprehensive Mock & Demo Data Store
// Provides realistic on-demand marketplace data across NCR (Delhi, Noida, Gurugram, etc.)

export const INITIAL_SERVICES = [
  {
    _id: 'srv_1',
    name: 'Emergency Auto Mechanic & Roadside Aid',
    category: 'Mechanic',
    description: 'Instant roadside breakdown assistance, battery jumpstarts, tire changes, engine diagnostics, and mobile towing dispatch across NCR within 15 minutes.',
    basePrice: 499,
    popular: true,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    subServices: [
      { name: 'Emergency Battery Jumpstart & Diagnostic', price: 349 },
      { name: 'Tubeless Tire Puncture & Inflate on Spot', price: 249 },
      { name: 'On-Spot Engine Overheating Inspection', price: 599 },
      { name: 'Brake Fluid & Brake Pad Fast Replacement', price: 799 }
    ]
  },
  {
    _id: 'srv_2',
    name: 'Licensed Emergency Electrician & Rewiring',
    category: 'Electrician',
    description: 'Certified technicians for tripping MCBs, short-circuit repairs, inverter/UPS troubleshooting, phase fault fixing, and heavy appliance installations.',
    basePrice: 299,
    popular: true,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    subServices: [
      { name: 'Short Circuit & MCB Trip Repair', price: 299 },
      { name: 'Inverter & Battery Wiring Fault Fix', price: 449 },
      { name: 'AC / Geyser Heavy Power Point Installation', price: 399 },
      { name: 'Full Apartment Safety Electrical Audit', price: 899 }
    ]
  },
  {
    _id: 'srv_3',
    name: 'Full Home Deep Cleaning & Sanitization',
    category: 'Homemaker',
    description: 'Professional cleaning crew equipped with industrial vacuum cleaners, eco-friendly disinfectants, bathroom de-scaling, and modular kitchen degreasing.',
    basePrice: 799,
    popular: true,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    subServices: [
      { name: 'Modular Kitchen Deep Degreasing', price: 799 },
      { name: 'Bathroom Tile & Tap Acid-Free De-scaling', price: 499 },
      { name: 'Complete 2BHK/3BHK Move-In Deep Clean', price: 1799 },
      { name: 'Sofa & Carpet Anti-Allergen Shampooing', price: 699 }
    ]
  },
  {
    _id: 'srv_4',
    name: 'On-Demand Physician & Home Health Consult',
    category: 'Doctor',
    description: 'Verified MBBS/MD doctors for at-home vitals examination, urgent clinical consults, geriatric checkups, and verified digital prescription issuance.',
    basePrice: 699,
    popular: false,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    subServices: [
      { name: 'Comprehensive General Physical Checkup', price: 699 },
      { name: 'ECG & Vitals Assessment at Doorstep', price: 899 },
      { name: 'Post-Hospitalization Patient Review', price: 999 }
    ]
  },
  {
    _id: 'srv_5',
    name: 'Certified Senior Citizen & Patient Caretaker',
    category: 'Caretaker',
    description: 'Compassionate, background-checked attendants for elderly assisted living, mobility support, medication management, and bedside companion care.',
    basePrice: 599,
    popular: true,
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80',
    subServices: [
      { name: 'Day Care Attendant (8-Hour Shift)', price: 999 },
      { name: 'Post-Surgery Bedside Recovery Care', price: 1299 },
      { name: 'Mobility & Physiotherapy Assisted Walk', price: 499 }
    ]
  },
  {
    _id: 'srv_6',
    name: 'STEM & Board Exam Home Tutor',
    category: 'Tutor',
    description: 'Qualified educators providing customized 1-on-1 academic mentorship for CBSE, ICSE, and competitive foundations (Maths, Physics, Chemistry).',
    basePrice: 450,
    popular: false,
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
    subServices: [
      { name: 'Class 9-12 Mathematics Intensive', price: 450 },
      { name: 'Physics & Chemistry Numerical Drills', price: 450 },
      { name: 'Weekly Board Exam Mock Test & Analysis', price: 350 }
    ]
  },
  {
    _id: 'srv_7',
    name: 'Master Plumber & Pipe Leak Specialist',
    category: 'Plumber',
    description: 'Rapid-response master plumbers for concealed pipe leaks, blockage clearing, tap and flush valve replacements, and water tank overflow troubleshooting.',
    basePrice: 249,
    popular: true,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
    subServices: [
      { name: 'Concealed Water Leak Acoustic Detection', price: 499 },
      { name: 'High-Pressure Drain & Sewer Unclogging', price: 399 },
      { name: 'RO & Water Purifier Valve Connection', price: 299 },
      { name: 'Complete Bathroom Sanitary Ware Fitting', price: 999 }
    ]
  },
  {
    _id: 'srv_8',
    name: 'Wall Painter & Waterproofing Specialist',
    category: 'Painter',
    description: 'Skilled painters for flawless interior walls, anti-damp seepage coatings, accent wall textures, and fast 1-day home touchups using Asian Paints.',
    basePrice: 650,
    popular: false,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
    subServices: [
      { name: 'Anti-Damp Moisture Seepage Primer Treatment', price: 750 },
      { name: 'Designer Stencil / Texture Feature Wall', price: 1200 },
      { name: 'Quick 1-Room Premium Emulsion Painting', price: 1800 }
    ]
  }
];

export const MOCK_USERS = {
  customer: {
    id: 'user_cust_1',
    _id: 'user_cust_1',
    name: 'Rahul Sharma',
    email: 'customer@serviceman.com',
    phone: '+919876543210',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    city: 'Noida',
    address: 'Tower 4, Sector 128, Jaypee Greens, Noida',
    location: {
      type: 'Point',
      coordinates: [77.3736, 28.5204]
    },
    warningCount: 0
  },
  provider: {
    id: 'user_prov_1',
    _id: 'user_prov_1',
    name: 'Vikram Singh',
    email: 'provider@serviceman.com',
    phone: '+919812345678',
    role: 'provider',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    city: 'Noida',
    address: 'Near Wave City Center, Sector 32, Noida',
    location: {
      type: 'Point',
      coordinates: [77.3450, 28.5450]
    },
    warningCount: 0
  },
  electrician: {
    id: 'user_prov_2',
    _id: 'user_prov_2',
    name: 'Amit Verma',
    email: 'electrician@serviceman.com',
    phone: '+919899112233',
    role: 'provider',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    city: 'Noida',
    address: 'Sector 62, Noida',
    location: {
      type: 'Point',
      coordinates: [77.3620, 28.6250]
    },
    warningCount: 1
  },
  admin: {
    id: 'user_admin_1',
    _id: 'user_admin_1',
    name: 'ServiceMan Operations HQ',
    email: 'admin@serviceman.com',
    phone: '+919999000000',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    city: 'Noida',
    address: 'ServiceMan Technology Park, Sector 142, Noida',
    location: {
      type: 'Point',
      coordinates: [77.4100, 28.5000]
    },
    warningCount: 0
  }
};

export const MOCK_PROVIDER_PROFILE = {
  _id: 'prov_prof_1',
  userId: MOCK_USERS.provider,
  categories: ['Mechanic'],
  experienceYears: 8,
  qualification: 'ITI Certified Automobile Master Technician (Govt. of India)',
  hourlyRate: 399,
  serviceRadiusKm: 25,
  isOnline: true,
  isAvailable: true,
  kycStatus: 'verified',
  ratingAverage: 4.9,
  ratingCount: 64,
  trustScore: 92,
  hasTrustBadge: true,
  totalEarnings: 18450,
  pendingPayout: 3120,
  completedJobsCount: 48,
  bankDetails: {
    accountHolderName: 'Vikram Singh',
    bankName: 'HDFC Bank Ltd.',
    accountNumber: '••••••••7890',
    ifscCode: 'HDFC0001234',
    upiId: 'vikram.singh@okhdfcbank'
  }
};

export const MOCK_NEARBY_PROVIDERS = [
  {
    _id: 'prov_near_1',
    userId: {
      _id: 'user_prov_1',
      name: 'Vikram Singh',
      phone: '+919812345678',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      city: 'Noida'
    },
    categories: ['Mechanic'],
    experienceYears: 8,
    qualification: 'Automobile Master Technician',
    hourlyRate: 399,
    ratingAverage: 4.9,
    ratingCount: 64,
    trustScore: 92,
    hasTrustBadge: true,
    isOnline: true,
    location: {
      type: 'Point',
      coordinates: [77.3450, 28.5450]
    },
    distanceKm: 3.2,
    etaMinutes: 12
  },
  {
    _id: 'prov_near_2',
    userId: {
      _id: 'user_prov_2',
      name: 'Amit Verma',
      phone: '+919899112233',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      city: 'Noida'
    },
    categories: ['Electrician'],
    experienceYears: 6,
    qualification: 'Govt. Licensed Electrical Contractor',
    hourlyRate: 299,
    ratingAverage: 4.7,
    ratingCount: 39,
    trustScore: 81,
    hasTrustBadge: true,
    isOnline: true,
    location: {
      type: 'Point',
      coordinates: [77.3620, 28.5380]
    },
    distanceKm: 2.1,
    etaMinutes: 9
  },
  {
    _id: 'prov_near_3',
    userId: {
      _id: 'user_prov_3',
      name: 'Sunita Devi',
      phone: '+919711223344',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      city: 'Noida'
    },
    categories: ['Homemaker'],
    experienceYears: 5,
    qualification: 'Certified Hospitality & Housekeeping Supervisor',
    hourlyRate: 350,
    ratingAverage: 4.95,
    ratingCount: 82,
    trustScore: 96,
    hasTrustBadge: true,
    isOnline: true,
    location: {
      type: 'Point',
      coordinates: [77.3810, 28.5150]
    },
    distanceKm: 1.8,
    etaMinutes: 8
  }
];

export const INITIAL_BOOKING = {
  _id: 'bk_active_901',
  bookingNumber: 'SM-2026-7890',
  customerId: MOCK_USERS.customer,
  providerId: MOCK_USERS.provider,
  serviceId: INITIAL_SERVICES[0],
  status: 'ACCEPTED',
  problemDescription: 'Car engine stalled near Express Highway, battery clicking sound, need immediate roadside technician.',
  address: 'Tower 4, Sector 128, Jaypee Greens',
  city: 'Noida',
  customerLocation: {
    type: 'Point',
    coordinates: [77.3736, 28.5204]
  },
  providerLiveLocation: {
    type: 'Point',
    coordinates: [77.3450, 28.5450]
  },
  estimatedPrice: 499,
  finalPrice: 499,
  paymentStatus: 'pending',
  paymentMethod: 'razorpay',
  startOtp: '7294',
  urgency: 'high',
  createdAt: new Date().toISOString(),
  providerProfile: {
    rating: 4.9,
    trustScore: 92,
    hasTrustBadge: true,
    hourlyRate: 399
  }
};

export const INITIAL_COMPLETED_BOOKINGS = [
  {
    _id: 'bk_comp_101',
    bookingNumber: 'SM-2026-1120',
    customerId: MOCK_USERS.customer,
    providerId: MOCK_USERS.provider,
    serviceId: INITIAL_SERVICES[0],
    status: 'SERVICE_COMPLETED',
    problemDescription: 'Emergency battery replacement & starter diagnostics.',
    address: 'Sector 128, Noida',
    city: 'Noida',
    estimatedPrice: 499,
    finalPrice: 499,
    paymentStatus: 'completed',
    paymentMethod: 'razorpay',
    startOtp: '4192',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    customerReview: {
      rating: 5,
      comment: 'Vikram reached within 12 minutes in the rain! Fixed the loose terminal and tested the battery alternator. Incredible service!'
    }
  },
  {
    _id: 'bk_comp_102',
    bookingNumber: 'SM-2026-0984',
    customerId: MOCK_USERS.customer,
    providerId: MOCK_USERS.electrician,
    serviceId: INITIAL_SERVICES[1],
    status: 'CLOSED',
    problemDescription: 'Main circuit breaker trip fix during evening peak load.',
    address: 'Sector 128, Noida',
    city: 'Noida',
    estimatedPrice: 299,
    finalPrice: 299,
    paymentStatus: 'completed',
    paymentMethod: 'razorpay',
    startOtp: '8310',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    customerReview: {
      rating: 4.8,
      comment: 'Very polite electrician. Explained the overload issue clearly and replaced the faulty MCB safely.'
    }
  }
];

export const INITIAL_KYC_DOCUMENTS = [
  {
    _id: 'kyc_doc_1',
    providerId: {
      _id: 'user_prov_1',
      name: 'Vikram Singh',
      phone: '+919812345678',
      city: 'Noida'
    },
    documentType: 'aadhaar',
    documentNumber: '•••• •••• 4589',
    fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    status: 'verified',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    _id: 'kyc_doc_2',
    providerId: {
      _id: 'user_prov_1',
      name: 'Vikram Singh',
      phone: '+919812345678',
      city: 'Noida'
    },
    documentType: 'certificate',
    documentNumber: 'ITI-DEL-2018-9921',
    fileUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
    status: 'verified',
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString()
  },
  {
    _id: 'kyc_doc_3',
    providerId: {
      _id: 'user_prov_4',
      name: 'Rajesh Kumar',
      phone: '+919871100223',
      city: 'Gurugram'
    },
    documentType: 'driving_license',
    documentNumber: 'DL-042019008812',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const INITIAL_COMPLAINTS = [
  {
    _id: 'comp_001',
    complainantId: {
      _id: 'user_cust_2',
      name: 'Pooja Verma',
      phone: '+919871234567'
    },
    complainantRole: 'customer',
    respondentId: {
      _id: 'user_prov_2',
      name: 'Amit Verma',
      role: 'provider'
    },
    reportedUserId: {
      _id: 'user_prov_2',
      name: 'Amit Verma',
      role: 'provider'
    },
    category: 'late_arrival',
    description: 'Technician arrived 35 minutes late without prior phone call notification during an electrical emergency.',
    severity: 'minor',
    status: 'resolved',
    actionTaken: 'warning_issued',
    resolutionAction: 'warning_issued',
    adminNotes: 'First warning issued. Provider reminded to message via app in case of traffic delays.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    _id: 'comp_002',
    complainantId: {
      _id: 'user_cust_3',
      name: 'Sunil Mehta',
      phone: '+919988776655'
    },
    complainantRole: 'customer',
    respondentId: {
      _id: 'user_prov_5',
      name: 'Mohit Sharma',
      role: 'provider'
    },
    reportedUserId: {
      _id: 'user_prov_5',
      name: 'Mohit Sharma',
      role: 'provider'
    },
    category: 'overcharging',
    description: 'Requested ₹400 extra in cash outside the app invoice for standard plumbing washers.',
    severity: 'moderate',
    status: 'open',
    actionTaken: 'none',
    resolutionAction: null,
    adminNotes: '',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const INITIAL_AI_REVIEWS = [
  {
    _id: 'rev_ai_1',
    bookingId: 'bk_comp_101',
    authorId: MOCK_USERS.customer,
    recipientId: MOCK_USERS.provider,
    rating: 5,
    comment: 'Vikram reached within 12 minutes in the rain! Fixed the loose terminal and tested the battery alternator. Incredible service!',
    analysis: {
      sentimentLabel: 'positive',
      sentimentScore: 0.96,
      trustScoreDelta: 4,
      fraudScore: 5,
      abusiveLanguageDetected: false
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: 'rev_ai_2',
    bookingId: 'bk_comp_102',
    authorId: MOCK_USERS.customer,
    recipientId: MOCK_USERS.electrician,
    rating: 4.8,
    comment: 'Very polite electrician. Explained the overload issue clearly and replaced the faulty MCB safely.',
    analysis: {
      sentimentLabel: 'positive',
      sentimentScore: 0.88,
      trustScoreDelta: 3,
      fraudScore: 8,
      abusiveLanguageDetected: false
    },
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    _id: 'rev_ai_3',
    bookingId: 'bk_comp_103',
    authorId: {
      _id: 'user_cust_9',
      name: 'Simulated Quality Test Bot',
      role: 'customer'
    },
    recipientId: MOCK_USERS.provider,
    rating: 1,
    comment: 'Fake spam competitor review trying to lower rating intentionally.',
    analysis: {
      sentimentLabel: 'negative',
      sentimentScore: 0.92,
      trustScoreDelta: 0,
      fraudScore: 88,
      abusiveLanguageDetected: false
    },
    isFlagged: true,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  }
];

export const MOCK_ANALYTICS_DATA = {
  usersByCity: [
    { _id: 'Noida', customers: 412, providers: 84 },
    { _id: 'Delhi', customers: 628, providers: 119 },
    { _id: 'Gurugram', customers: 390, providers: 72 },
    { _id: 'Ghaziabad', customers: 215, providers: 48 },
    { _id: 'Faridabad', customers: 142, providers: 31 }
  ],
  bookingsByCategory: [
    { _id: 'Mechanic', count: 320, revenue: 159680 },
    { _id: 'Electrician', count: 284, revenue: 84916 },
    { _id: 'Homemaker', count: 198, revenue: 158202 },
    { _id: 'Plumber', count: 176, revenue: 43824 },
    { _id: 'Caretaker', count: 112, revenue: 67088 }
  ]
};

export const MOCK_AUDIT_LOGS = [
  {
    _id: 'aud_1',
    action: 'USER_LOGIN_SUCCESS',
    actorEmail: 'admin@serviceman.com',
    actorRole: 'admin',
    entityType: 'User',
    entityId: 'user_admin_1',
    ipAddress: '127.0.0.1 (Localhost)',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    _id: 'aud_2',
    action: 'KYC_DOC_APPROVED',
    actorEmail: 'admin@serviceman.com',
    actorRole: 'admin',
    entityType: 'ProviderKYC',
    entityId: 'kyc_doc_1',
    ipAddress: '127.0.0.1 (Localhost)',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    _id: 'aud_3',
    action: 'DISPATCH_MATCHED_SUCCESS',
    actorEmail: 'system@serviceman.ai',
    actorRole: 'system',
    entityType: 'ServiceRequest',
    entityId: 'sr_9921',
    ipAddress: '127.0.0.1 (Engine)',
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString()
  }
];
