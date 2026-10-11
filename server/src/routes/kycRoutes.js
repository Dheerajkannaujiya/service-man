const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getMyDocuments,
  getPendingKycDocuments,
  reviewDocument
} = require('../controllers/kycController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const upload = require('../middleware/upload');

router.use(protect);

// Provider routes
router.post('/upload', authorize('provider'), upload.single('documentFile'), uploadDocument);
router.get('/my-documents', authorize('provider'), getMyDocuments);

// Admin routes
router.get('/pending', authorize('admin'), getPendingKycDocuments);
router.put('/review/:documentId', authorize('admin'), reviewDocument);

module.exports = router;
