const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/env');

const User = require('../models/User');
const Customer = require('../models/Customer');
const Provider = require('../models/Provider');
const Admin = require('../models/Admin');
const Service = require('../models/Service');
const KycDocument = require('../models/KycDocument');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const ReviewAnalysis = require('../models/ReviewAnalysis');
const ProviderTrustScore = require('../models/ProviderTrustScore');
const Complaint = require('../models/Complaint');
const Warning = require('../models/Warning');
const Suspension = require('../models/Suspension');
const Ban = require('../models/Ban');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');

async function seedDatabase(options = {}) {
  const { keepAlive = false, customUri = null } = (typeof options === 'boolean' ? { keepAlive: !options } : options);
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Connecting to MongoDB...');
      await mongoose.connect(customUri || config.MONGODB_URI);
      console.log('[Seed] Connected.');
    }
    console.log('[Seed] Clearing previous seed collections...');

    // Drop database or collections to reset indexes completely
    try {
      await mongoose.connection.db.dropDatabase();
      console.log('[Seed] Dropped previous database to reset all collections and indexes.');
    } catch (dropErr) {
      console.log('[Seed] Database clear bypassed:', dropErr.message);
    }

    console.log('[Seed] Seeding Services...');
    const services = await Service.insertMany([
      {
        name: 'Auto Mechanic & Breakdown Support',
        slug: 'auto-mechanic',
        category: 'Mechanic',
        description: 'On-demand car and two-wheeler repair, engine diagnostics, tyre puncture assistance, and jump-start service at your doorstep.',
        icon: 'Wrench',
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
        basePrice: 349,
        pricePerHour: 300,
        estimatedDurationMinutes: 60,
        popular: true,
        subServices: [
          { name: 'Battery Jump Start', price: 299, durationMinutes: 30, description: 'Rapid battery booster cables service' },
          { name: 'Tyre Puncture & Air Check', price: 199, durationMinutes: 30, description: 'Tubeless puncture repair at doorstep' },
          { name: 'Full Engine Diagnostic', price: 499, durationMinutes: 90, description: 'OBD2 computer scanning and inspection' }
        ]
      },
      {
        name: 'Professional Electrician',
        slug: 'electrician-service',
        category: 'Electrician',
        description: 'Certified electrical wiring, short-circuit diagnostics, MCB installation, appliance wiring, and fixture repair.',
        icon: 'Zap',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        basePrice: 249,
        pricePerHour: 250,
        estimatedDurationMinutes: 45,
        popular: true,
        subServices: [
          { name: 'Switchboard & Socket Repair', price: 149, durationMinutes: 30, description: 'Repair loose contacts and broken switches' },
          { name: 'Fan / Light Fixture Installation', price: 199, durationMinutes: 45, description: 'Ceiling fan, chandelier, and LED mounting' },
          { name: 'MCB / Short Circuit Troubleshooting', price: 399, durationMinutes: 60, description: 'Complete electrical panel diagnostics' }
        ]
      },
      {
        name: 'Deep Home Cleaning & Homemaker',
        slug: 'homemaker-cleaner',
        category: 'Homemaker',
        description: 'Trained homemakers and housekeeping professionals for kitchen scrubbing, bathroom sanitization, floor buffing, and dusting.',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
        basePrice: 499,
        pricePerHour: 200,
        estimatedDurationMinutes: 120,
        popular: true,
        subServices: [
          { name: 'Kitchen Deep Degreasing', price: 499, durationMinutes: 90, description: 'Chimney, tiles, countertops, and cabinet clean' },
          { name: 'Bathroom Acid-Free Sanitization', price: 399, durationMinutes: 60, description: 'Tile descaling and fixture polishing' },
          { name: 'Full 2BHK Deep Cleaning', price: 1499, durationMinutes: 240, description: 'Complete top-to-bottom sanitize package' }
        ]
      },
      {
        name: 'Doctor & Home Health Consultation',
        slug: 'doctor-consultation',
        category: 'Doctor',
        description: 'Qualified general physicians and medical practitioners for doorstep health visits, vitals checks, and preventive consultations.',
        icon: 'Stethoscope',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
        basePrice: 599,
        pricePerHour: 500,
        estimatedDurationMinutes: 30,
        popular: false,
        subServices: [
          { name: 'General Physician Home Visit', price: 599, durationMinutes: 30, description: 'Physical checkup, vitals and prescription' },
          { name: 'Elderly Vitals & Blood Glucose Check', price: 349, durationMinutes: 30, description: 'BP, SpO2, ECG, and Sugar monitoring' }
        ]
      },
      {
        name: 'Elderly & Patient Caretaker',
        slug: 'caretaker-service',
        category: 'Caretaker',
        description: 'Compassionate, verified attendants for post-surgery assistance, medication reminders, bed-ridden care, and companionship.',
        icon: 'HeartHandshake',
        image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80',
        basePrice: 399,
        pricePerHour: 180,
        estimatedDurationMinutes: 240,
        popular: false,
        subServices: [
          { name: '4-Hour Caretaker Shift', price: 699, durationMinutes: 240, description: 'Patient mobility, diet, and medicine support' },
          { name: 'Full Day Caretaker Assistance', price: 1299, durationMinutes: 480, description: '8-hour dedicated bedside care' }
        ]
      },
      {
        name: 'Home Tutor & Academic Mentor',
        slug: 'home-tutor',
        category: 'Tutor',
        description: 'Vetted academic tutors for Mathematics, Science, English, and competitive exam preparation for grades 1 to 12.',
        icon: 'GraduationCap',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
        basePrice: 350,
        pricePerHour: 350,
        estimatedDurationMinutes: 60,
        popular: false,
        subServices: [
          { name: 'Class 6-10 Math & Science Class', price: 400, durationMinutes: 60, description: '1-on-1 personalized concept building' },
          { name: 'High School Physics / Chemistry Coaching', price: 500, durationMinutes: 60, description: 'Board and competitive syllabus guidance' }
        ]
      },
      {
        name: 'Plumbing & Pipe Repair',
        slug: 'plumber-service',
        category: 'Plumber',
        description: 'Fast leak sealing, tap replacement, drainage unclogging, water tank repair, and pipeline installation.',
        icon: 'Droplets',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
        basePrice: 249,
        pricePerHour: 220,
        estimatedDurationMinutes: 45,
        popular: true,
        subServices: [
          { name: 'Tap & Shower Leakage Repair', price: 179, durationMinutes: 30, description: 'Gasket replacement and water line fixing' },
          { name: 'Drainage Jet Unclogging', price: 349, durationMinutes: 45, description: 'Kitchen and bathroom drain clearing' }
        ]
      },
      {
        name: 'Home Painting & Waterproofing',
        slug: 'painter-service',
        category: 'Painter',
        description: 'Interior wall painting, texture artistry, exterior weatherproof coating, and dampness treatment.',
        icon: 'Paintbrush',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
        basePrice: 499,
        pricePerHour: 250,
        estimatedDurationMinutes: 180,
        popular: false,
        subServices: [
          { name: 'Single Accent Wall Painting', price: 799, durationMinutes: 120, description: 'Premium emulsion with smooth finish' },
          { name: 'Water Seepage & Crack Sealing', price: 649, durationMinutes: 90, description: 'Silicone and polymer waterproof coating' }
        ]
      }
    ]);

    console.log(`[Seed] Seeded ${services.length} services.`);

    console.log('[Seed] Seeding Users (Customer, Providers, Admin)...');

    // 1. Customer: Rahul Sharma
    const customerUser = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@serviceman.com',
      phone: '+919876543210',
      passwordHash: 'Password123!',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      address: 'Tower 4, Flat 702, Jaypee Greens, Sector 128',
      city: 'Noida',
      location: { type: 'Point', coordinates: [77.3736, 28.5204] }
    });

    await Customer.create({
      userId: customerUser._id,
      emergencyContact: { name: 'Sunita Sharma', phone: '+919876543211', relation: 'Mother' },
      savedAddresses: [
        { label: 'Home', address: 'Tower 4, Flat 702, Jaypee Greens, Sector 128, Noida', city: 'Noida', location: { type: 'Point', coordinates: [77.3736, 28.5204] } },
        { label: 'Office', address: 'Advant Navis Business Park, Sector 142, Noida', city: 'Noida', location: { type: 'Point', coordinates: [77.4120, 28.5028] } }
      ]
    });

    // 2. Verified Provider: Vikram Singh (Mechanic) - With Trust Badge
    const mechanicUser = await User.create({
      name: 'Vikram Singh',
      email: 'provider@serviceman.com',
      phone: '+919811122233',
      passwordHash: 'Password123!',
      role: 'provider',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      address: 'Shop 14, Atta Market, Sector 18',
      city: 'Noida',
      location: { type: 'Point', coordinates: [77.3242, 28.5708] }
    });

    const mechanicProfile = await Provider.create({
      userId: mechanicUser._id,
      categories: ['Mechanic'],
      bio: 'Certified automobile technician with 8+ years experience in luxury cars and roadside breakdown support.',
      experienceYears: 8,
      qualification: 'Diploma in Automotive Engineering & ASE Certified',
      hourlyRate: 350,
      serviceRadiusKm: 25,
      isOnline: true,
      isAvailable: true,
      currentLocation: { type: 'Point', coordinates: [77.3242, 28.5708] },
      kycStatus: 'verified',
      trustScore: 92,
      hasTrustBadge: true,
      ratingAverage: 4.9,
      ratingCount: 48,
      completedBookings: 62,
      totalEarnings: 32400,
      pendingPayout: 4200,
      bankDetails: {
        accountHolderName: 'Vikram Singh',
        accountNumber: '50100234567890',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank Sector 18',
        upiId: 'vikram.singh@okhdfcbank'
      }
    });

    await ProviderTrustScore.create({
      providerId: mechanicUser._id,
      currentScore: 92,
      factors: {
        kycScore: 25,
        ratingScore: 39,
        completionScore: 20,
        sentimentBonus: 8,
        cancellationPenalty: 0,
        complaintPenalty: 0,
        fraudPenalty: 0
      },
      hasTrustBadge: true,
      badgeGrantedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      history: [
        { score: 85, reason: 'Initial KYC Verification Approved', timestamp: new Date(Date.now() - 60 * 24 * 60 * 1000) },
        { score: 92, reason: 'Milestone: 50+ 5-star verified bookings completed', timestamp: new Date(Date.now() - 10 * 24 * 60 * 1000) }
      ]
    });

    // 3. Verified Provider: Amit Verma (Electrician) - With Trust Badge
    const electricianUser = await User.create({
      name: 'Amit Verma',
      email: 'electrician@serviceman.com',
      phone: '+919822233344',
      passwordHash: 'Password123!',
      role: 'provider',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      address: 'Main Market, Sector 62',
      city: 'Noida',
      location: { type: 'Point', coordinates: [77.3620, 28.6280] }
    });

    await Provider.create({
      userId: electricianUser._id,
      categories: ['Electrician'],
      bio: 'Licensed electrical contractor specializing in domestic smart home wiring, inverter setups, and electrical troubleshooting.',
      experienceYears: 6,
      qualification: 'ITI Electrical Wireman License',
      hourlyRate: 280,
      serviceRadiusKm: 20,
      isOnline: true,
      isAvailable: true,
      currentLocation: { type: 'Point', coordinates: [77.3620, 28.6280] },
      kycStatus: 'verified',
      trustScore: 88,
      hasTrustBadge: true,
      ratingAverage: 4.8,
      ratingCount: 36,
      completedBookings: 45,
      totalEarnings: 21800,
      pendingPayout: 2100,
      bankDetails: {
        accountHolderName: 'Amit Verma',
        accountNumber: '60200345678901',
        ifscCode: 'SBIN0004567',
        bankName: 'State Bank of India',
        upiId: 'amit.verma@oksbi'
      }
    });

    // 4. Pending KYC Provider: Pooja Rani (Homemaker)
    const cleanerUser = await User.create({
      name: 'Pooja Rani',
      email: 'cleaner@serviceman.com',
      phone: '+919833344455',
      passwordHash: 'Password123!',
      role: 'provider',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      address: 'Indirapuram, Habitat Centre',
      city: 'Ghaziabad',
      location: { type: 'Point', coordinates: [77.3710, 28.6410] }
    });

    await Provider.create({
      userId: cleanerUser._id,
      categories: ['Homemaker'],
      bio: 'Specialist in deep sanitation, sanitization machinery, and eco-friendly cleaning methods.',
      experienceYears: 4,
      qualification: 'Professional Housekeeping Certification',
      hourlyRate: 250,
      serviceRadiusKm: 15,
      isOnline: false,
      isAvailable: true,
      currentLocation: { type: 'Point', coordinates: [77.3710, 28.6410] },
      kycStatus: 'pending',
      trustScore: 70,
      hasTrustBadge: false,
      ratingAverage: 5.0,
      ratingCount: 2
    });

    // 5. Verified Provider: Dr. Ananya Roy (Doctor) - With Trust Badge
    const doctorUser = await User.create({
      name: 'Dr. Ananya Roy',
      email: 'doctor@serviceman.com',
      phone: '+919844455566',
      passwordHash: 'Password123!',
      role: 'provider',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
      address: 'Clinic 3, Max Hospital Complex, Sector 19',
      city: 'Noida',
      location: { type: 'Point', coordinates: [77.3312, 28.5772] }
    });

    await Provider.create({
      userId: doctorUser._id,
      categories: ['Doctor'],
      bio: 'MBBS, MD - General Physician with 10+ years clinical experience. Doorstep home visits, vitals diagnosis, senior citizen care, and preventive health consults.',
      experienceYears: 10,
      qualification: 'MBBS, MD (General Medicine) - MCI Registered',
      hourlyRate: 599,
      serviceRadiusKm: 25,
      isOnline: true,
      isAvailable: true,
      currentLocation: { type: 'Point', coordinates: [77.3312, 28.5772] },
      kycStatus: 'verified',
      trustScore: 96,
      hasTrustBadge: true,
      ratingAverage: 4.96,
      ratingCount: 52,
      completedBookings: 58,
      totalEarnings: 38400,
      pendingPayout: 4600,
      bankDetails: {
        accountHolderName: 'Dr. Ananya Roy',
        accountNumber: '40100456789012',
        ifscCode: 'ICIC0001234',
        bankName: 'ICICI Bank Sector 18',
        upiId: 'dr.ananya@okicici'
      }
    });

    await ProviderTrustScore.create({
      providerId: doctorUser._id,
      currentScore: 96,
      factors: {
        kycScore: 25,
        ratingScore: 40,
        completionScore: 20,
        sentimentBonus: 11,
        cancellationPenalty: 0,
        complaintPenalty: 0,
        fraudPenalty: 0
      },
      hasTrustBadge: true,
      badgeGrantedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    });

    // 6. Admin: Aditya Malhotra
    const adminUser = await User.create({
      name: 'Aditya Malhotra',
      email: 'admin@serviceman.com',
      phone: '+919999988888',
      passwordHash: 'Admin123!',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      address: 'ServiceMan Headquarters, Cyber City',
      city: 'Gurugram',
      location: { type: 'Point', coordinates: [77.0878, 28.4950] }
    });

    await Admin.create({
      userId: adminUser._id,
      department: 'Executive Operations',
      permissions: ['manage_users', 'verify_kyc', 'manage_providers', 'resolve_complaints', 'manage_bans', 'view_analytics']
    });

    console.log('[Seed] Seeding KYC Documents...');
    await KycDocument.create([
      {
        providerId: mechanicUser._id,
        documentType: 'aadhaar',
        documentNumber: 'XXXX-XXXX-4819',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80',
        fileName: 'Aadhaar_Vikram_Singh.pdf',
        status: 'verified',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      },
      {
        providerId: mechanicUser._id,
        documentType: 'trade_license',
        documentNumber: 'AUTO-MECH-UP-2021-9921',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80',
        fileName: 'Trade_License_Automotive.pdf',
        status: 'verified',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      },
      {
        providerId: cleanerUser._id,
        documentType: 'aadhaar',
        documentNumber: 'XXXX-XXXX-9281',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80',
        fileName: 'Aadhaar_Pooja_Rani.pdf',
        status: 'pending'
      },
      {
        providerId: cleanerUser._id,
        documentType: 'degree_certificate',
        documentNumber: 'HK-DIP-2022-3819',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80',
        fileName: 'Housekeeping_Cert.pdf',
        status: 'pending'
      },
      {
        providerId: doctorUser._id,
        documentType: 'degree_certificate',
        documentNumber: 'MCI-REG-2014-99821',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80',
        fileName: 'Medical_Council_Registration.pdf',
        status: 'verified',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      },
      {
        providerId: doctorUser._id,
        documentType: 'aadhaar',
        documentNumber: 'XXXX-XXXX-3891',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80',
        fileName: 'Aadhaar_Dr_Ananya.pdf',
        status: 'verified',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('[Seed] Seeding Sample Bookings & AI Reviews...');
    const mechanicService = services.find(s => s.category === 'Mechanic');

    // Past completed booking with review
    const pastBooking = await Booking.create({
      bookingNumber: 'SM-2026-10024',
      customerId: customerUser._id,
      providerId: mechanicUser._id,
      serviceId: mechanicService._id,
      status: 'CUSTOMER_REVIEWED',
      urgency: 'urgent',
      problemDescription: 'Car engine stalled on Expressway, battery warning light on.',
      address: 'Tower 4, Jaypee Greens, Sector 128, Noida',
      city: 'Noida',
      customerLocation: { type: 'Point', coordinates: [77.3736, 28.5204] },
      estimatedPrice: 349,
      finalPrice: 349,
      paymentStatus: 'paid',
      paymentMethod: 'razorpay',
      startOtp: '4821',
      timeline: [
        { status: 'REQUESTED', note: 'Customer requested emergency assistance' },
        { status: 'ACCEPTED', note: 'Vikram Singh accepted request' },
        { status: 'ARRIVED', note: 'Professional arrived on site' },
        { status: 'SERVICE_STARTED', note: 'OTP 4821 verified' },
        { status: 'SERVICE_COMPLETED', note: 'Alternator cable reconnected and battery jumped' },
        { status: 'CUSTOMER_REVIEWED', note: 'Customer submitted 5-star review' }
      ],
      acceptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000)
    });

    const pastReview = await Review.create({
      bookingId: pastBooking._id,
      authorId: customerUser._id,
      recipientId: mechanicUser._id,
      authorRole: 'customer',
      rating: 5,
      comment: 'Vikram arrived in just 15 minutes! Very polite, diagnosed the faulty alternator terminal immediately and fixed it on the spot. Highly recommended!'
    });

    await ReviewAnalysis.create({
      reviewId: pastReview._id,
      providerId: mechanicUser._id,
      sentimentScore: 0.92,
      sentimentLabel: 'positive',
      abusiveLanguageDetected: false,
      abusiveKeywords: [],
      suspiciousPatternDetected: false,
      fraudScore: 0,
      fraudReasons: [],
      qualityScore: 98,
      trustScoreDelta: 2,
      adminAction: 'none'
    });

    pastBooking.customerReview = pastReview._id;
    await pastBooking.save();

    // Active in-progress booking for live demonstration
    const activeBooking = await Booking.create({
      bookingNumber: 'SM-2026-10492',
      customerId: customerUser._id,
      providerId: mechanicUser._id,
      serviceId: mechanicService._id,
      status: 'PROVIDER_ON_THE_WAY',
      urgency: 'urgent',
      problemDescription: 'Right front tyre punctured. Need doorstep replacement and air pressure calibration.',
      address: 'Tower 4, Flat 702, Jaypee Greens, Sector 128, Noida',
      city: 'Noida',
      customerLocation: { type: 'Point', coordinates: [77.3736, 28.5204] },
      providerLiveLocation: { type: 'Point', coordinates: [77.3450, 28.5450] },
      startOtp: '7294',
      estimatedPrice: 349,
      finalPrice: 349,
      paymentStatus: 'pending',
      paymentMethod: 'razorpay',
      timeline: [
        { status: 'REQUESTED', note: 'Customer submitted roadside tyre repair request' },
        { status: 'ACCEPTED', note: 'Vikram Singh accepted and assigned' },
        { status: 'PROVIDER_ON_THE_WAY', note: 'Professional dispatched with equipment' }
      ],
      acceptedAt: new Date(Date.now() - 10 * 60 * 1000)
    });

    console.log('[Seed] Seeding Sample Complaint & Warning for Admin Quality Control testing...');
    const complaint = await Complaint.create({
      bookingId: pastBooking._id,
      complainantId: customerUser._id,
      respondentId: electricianUser._id,
      complainantRole: 'customer',
      category: 'unprofessional_behavior',
      description: 'Technician was 40 minutes late without notification on previous service attempt.',
      status: 'resolved',
      severity: 'medium',
      adminNotes: 'Spoke with technician. Reminded regarding punctuality and customer notification requirements.',
      actionTaken: 'warning_issued',
      resolvedBy: adminUser._id,
      resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    await Warning.create({
      providerId: electricianUser._id,
      complaintId: complaint._id,
      reason: 'Punctuality breach: Arrived 40 minutes after scheduled slot without informing client.',
      warningNumber: 1,
      issuedBy: adminUser._id,
      acknowledgedByProvider: true
    });

    electricianUser.warningCount = 1;
    await electricianUser.save();

    console.log('[Seed] Seeding Notifications...');
    await Notification.create([
      {
        userId: customerUser._id,
        title: 'Provider Dispatched!',
        message: 'Vikram Singh is on the way to your location for Booking #SM-2026-10492.',
        type: 'provider_arriving',
        data: { bookingId: activeBooking._id }
      },
      {
        userId: mechanicUser._id,
        title: 'New Service Accepted',
        message: 'You have accepted Booking #SM-2026-10492 in Sector 128, Noida.',
        type: 'booking_accepted',
        data: { bookingId: activeBooking._id }
      }
    ]);

    console.log('\n==================================================');
    console.log(' SEED COMPLETED SUCCESSFULLY! DEMO CREDENTIALS:');
    console.log('==================================================');
    console.log('1. Customer:');
    console.log('   Email:    customer@serviceman.com');
    console.log('   Password: Password123!');
    console.log('   Location: Sector 128, Noida\n');
    console.log('2. Verified Provider (Mechanic - Trusted Badge):');
    console.log('   Email:    provider@serviceman.com');
    console.log('   Password: Password123!');
    console.log('   Trust:    92% (Verified & Trusted Badge)\n');
    console.log('3. Verified Provider (Electrician - 1 Warning):');
    console.log('   Email:    electrician@serviceman.com');
    console.log('   Password: Password123!\n');
    console.log('4. Verified Provider (Doctor - Trusted Badge):');
    console.log('   Email:    doctor@serviceman.com');
    console.log('   Password: Password123!');
    console.log('   Trust:    96% (MBBS, MD Verified)\n');
    console.log('5. Pending KYC Provider (Homemaker/Cleaner):');
    console.log('   Email:    cleaner@serviceman.com');
    console.log('   Password: Password123!\n');
    console.log('6. Administrator:');
    console.log('   Email:    admin@serviceman.com');
    console.log('   Password: Admin123!');
    console.log('==================================================\n');

    if (!keepAlive) {
      process.exit(0);
    }
    return true;
  } catch (err) {
    console.error('[Seed Error]', err);
    if (!keepAlive) {
      process.exit(1);
    }
    throw err;
  }
}

if (require.main === module) {
  seedDatabase({ keepAlive: false });
}

module.exports = { seedDatabase };
