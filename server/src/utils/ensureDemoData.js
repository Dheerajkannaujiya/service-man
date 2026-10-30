const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
const Notification = require('../models/Notification');

const CORE_SERVICES = [
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
    popular: true,
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
];

async function ensureDemoData() {
  try {
    // 1. Ensure Services Exist
    for (const s of CORE_SERVICES) {
      const existing = await Service.findOne({ slug: s.slug });
      if (!existing) {
        await Service.create(s);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const standardHash = await bcrypt.hash('Password123!', salt);
    const adminHash = await bcrypt.hash('Admin123!', salt);

    // 2. Customer: Rahul Sharma
    let customerUser = await User.findOne({ email: 'customer@serviceman.com' });
    if (!customerUser) {
      customerUser = await User.create({
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
          { label: 'Home', address: 'Tower 4, Flat 702, Jaypee Greens, Sector 128, Noida', city: 'Noida', location: { type: 'Point', coordinates: [77.3736, 28.5204] } }
        ]
      });
    } else {
      // Ensure password is Password123!
      await User.updateOne({ _id: customerUser._id }, { $set: { passwordHash: standardHash } });
    }

    // 3. Mechanic Pro: Vikram Singh
    let mechanicUser = await User.findOne({ email: 'provider@serviceman.com' });
    if (!mechanicUser) {
      mechanicUser = await User.create({
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
      await Provider.create({
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
        pendingPayout: 4200
      });
      await ProviderTrustScore.create({
        providerId: mechanicUser._id,
        currentScore: 92,
        hasTrustBadge: true,
        badgeGrantedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      });
      await KycDocument.create([
        {
          providerId: mechanicUser._id,
          documentType: 'aadhaar',
          documentNumber: 'XXXX-XXXX-4819',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80',
          fileName: 'Aadhaar_Vikram_Singh.pdf',
          status: 'verified'
        }
      ]);
    } else {
      await User.updateOne({ _id: mechanicUser._id }, { $set: { passwordHash: standardHash } });
    }

    // 4. Electrician Pro: Amit Verma
    let electricianUser = await User.findOne({ email: 'electrician@serviceman.com' });
    if (!electricianUser) {
      electricianUser = await User.create({
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
        pendingPayout: 2100
      });
      await ProviderTrustScore.create({
        providerId: electricianUser._id,
        currentScore: 88,
        hasTrustBadge: true,
        badgeGrantedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      });
    } else {
      await User.updateOne({ _id: electricianUser._id }, { $set: { passwordHash: standardHash } });
    }

    // 5. Doctor Pro: Dr. Ananya Roy
    let doctorUser = await User.findOne({ email: 'doctor@serviceman.com' });
    if (!doctorUser) {
      doctorUser = await User.create({
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
        pendingPayout: 4600
      });
      await ProviderTrustScore.create({
        providerId: doctorUser._id,
        currentScore: 96,
        hasTrustBadge: true,
        badgeGrantedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      });
      await KycDocument.create([
        {
          providerId: doctorUser._id,
          documentType: 'degree_certificate',
          documentNumber: 'MCI-REG-2014-99821',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80',
          fileName: 'Medical_Council_Certificate.pdf',
          status: 'verified'
        }
      ]);
    } else {
      await User.updateOne({ _id: doctorUser._id }, { $set: { passwordHash: standardHash } });
    }

    // 6. Cleaner / Homemaker: Pooja Rani
    let cleanerUser = await User.findOne({ email: 'cleaner@serviceman.com' });
    if (!cleanerUser) {
      cleanerUser = await User.create({
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
      await KycDocument.create([
        {
          providerId: cleanerUser._id,
          documentType: 'aadhaar',
          documentNumber: 'XXXX-XXXX-9281',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80',
          fileName: 'Aadhaar_Pooja_Rani.pdf',
          status: 'pending'
        }
      ]);
    } else {
      await User.updateOne({ _id: cleanerUser._id }, { $set: { passwordHash: standardHash } });
    }

    // 7. Admin: Aditya Malhotra
    let adminUser = await User.findOne({ email: 'admin@serviceman.com' });
    if (!adminUser) {
      adminUser = await User.create({
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
    } else {
      await User.updateOne({ _id: adminUser._id }, { $set: { passwordHash: adminHash } });
    }

    // 8. Ensure Sample Active Booking exists for Customer & Mechanic if no bookings exist
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0 && customerUser && mechanicUser) {
      const mechanicService = await Service.findOne({ category: 'Mechanic' });
      if (mechanicService) {
        await Booking.create({
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
      }
    }

    console.log('[DemoData] All demo users (Customer, Mechanic, Electrician, Doctor, Cleaner, Admin) & services verified.');
    return true;
  } catch (err) {
    console.error('[DemoData Error]', err.message);
    return false;
  }
}

module.exports = { ensureDemoData };
