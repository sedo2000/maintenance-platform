const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addReview, getReviews } = require('../controllers/reviewController');

router.get('/:providerId', getReviews);
router.post('/:providerId', protect, addReview);

module.exports = router;
