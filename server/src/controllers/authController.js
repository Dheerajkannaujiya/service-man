const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Provider = require('../models/Provider');
const Admin = require('../models/Admin');
const Ban = require('../models/Ban');
const config = require('../config/env');
const { logAudit } = require('../middleware/auditLogger');
const { getCityDefaultCoordinates } = require('../services/geoService');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

/**
 * Register a new User (Customer, Provider, or Admin)
 */
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = 'customer',
      address,
      city = 'Noida',
      coordinates,
      // Provider-specific fields
      categories,
      experienceYears,
      qualification,
      hourlyRate,
      serviceRadiusKm,
      bankDetails
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, and password.'
      });
    }

    // Check if identity is permanently banned
    const emailBan = await Ban.findOne({ email: email.toLowerCase() });
    const phoneBan = await Ban.findOne({ phone });
    if (emailBan || phoneBan) {
      return res.status(403).json({
        success: false,
        message: 'This identity (email or phone) has been permanently banned from ServiceMan.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address or phone number already exists.'
      });
    }

    // Determine default coordinates if not provided
    const defaultCoords = getCityDefaultCoordinates(city);
    const resolvedCoords = coordinates && Array.isArray(coordinates) && coordinates.length === 2
      ? coordinates
      : [defaultCoords.lng, defaultCoords.lat];

    // Create Base User
    const user = await User.create({
      name,
      email,
      phone,
      passwordHash: password,
      role,
      address: address || '',
      city,
      location: {
        type: 'Point',
        coordinates: resolvedCoords
      }
    });

    // Create Role-Specific Profile
    if (role === 'customer') {
      await Customer.create({
        userId: user._id,
        savedAddresses: address ? [{ label: 'Home', address, city, location: { type: 'Point', coordinates: resolvedCoords } }] : []
      });
    } else if (role === 'provider') {
      const selectedCategories = categories && categories.length > 0 ? categories : ['Mechanic'];
      await Provider.create({
        userId: user._id,
        categories: selectedCategories,
        experienceYears: Number(experienceYears) || 2,
        qualification: qualification || 'Certified Professional',
        hourlyRate: Number(hourlyRate) || 299,
        serviceRadiusKm: Number(serviceRadiusKm) || 20,
        currentLocation: {
          type: 'Point',
          coordinates: resolvedCoords
        },
        bankDetails: bankDetails || {},
        kycStatus: 'pending'
      });
    } else if (role === 'admin') {
      await Admin.create({
        userId: user._id,
        department: 'Operations'
      });
    }

    const token = generateToken(user._id);

    await logAudit(req, 'USER_REGISTERED', 'User', user._id, { role, email });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        city: user.city,
        address: user.address,
        location: user.location
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login User
 */
exports.login = async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email/phone and password.'
      });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }]
    }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/phone and password.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/phone and password.'
      });
    }

    // Check Ban Status
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Account is permanently banned: "${user.bannedReason || 'Terms violation'}". Registration and login are prohibited.`
      });
    }

    // Check Suspension Status
    if (user.isSuspended) {
      if (user.suspendedUntil && new Date() > new Date(user.suspendedUntil)) {
        user.isSuspended = false;
        user.suspendedUntil = null;
        await user.save();
      } else {
        return res.status(403).json({
          success: false,
          message: `Account is temporarily suspended until ${user.suspendedUntil ? new Date(user.suspendedUntil).toLocaleDateString() : 'admin review'}.`
        });
      }
    }

    let roleProfile = null;
    if (user.role === 'customer') {
      roleProfile = await Customer.findOne({ userId: user._id });
    } else if (user.role === 'provider') {
      roleProfile = await Provider.findOne({ userId: user._id });
    } else if (user.role === 'admin') {
      roleProfile = await Admin.findOne({ userId: user._id });
    }

    const token = generateToken(user._id);

    await logAudit(req, 'USER_LOGIN_SUCCESS', 'User', user._id, { role: user.role, email: user.email });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        city: user.city,
        address: user.address,
        location: user.location,
        warningCount: user.warningCount,
        roleProfile
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current authenticated user profile with role data
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let roleProfile = null;

    if (user.role === 'customer') {
      roleProfile = await Customer.findOne({ userId: user._id });
    } else if (user.role === 'provider') {
      roleProfile = await Provider.findOne({ userId: user._id });
    } else if (user.role === 'admin') {
      roleProfile = await Admin.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        city: user.city,
        address: user.address,
        location: user.location,
        warningCount: user.warningCount,
        roleProfile
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city, avatar, coordinates } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city) user.city = city;
    if (avatar) user.avatar = avatar;

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      user.location = {
        type: 'Point',
        coordinates
      };
      // If provider, update currentLocation too
      if (user.role === 'provider') {
        await Provider.findOneAndUpdate(
          { userId: user._id },
          { currentLocation: { type: 'Point', coordinates } }
        );
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        city: user.city,
        address: user.address,
        location: user.location
      }
    });
  } catch (err) {
    next(err);
  }
};
