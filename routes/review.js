const express = require("express");
const router = express.Router({ mergeParams: true });   // ✅ Fixed
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
// const { reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {validateReview, isLoggedIn,isReviewAuthor} = require("../middleware.js");
const { createReview } = require("../controllers/reviews.js");

const reviewController = require("../controllers/reviews.js");
const { destoryListing } = require("../controllers/listing.js");



// Reviews
//POST  review  Route
router.post(
    "/",
    isLoggedIn,
     validateReview, 
     wrapAsync(reviewController. createReview)
);

// Delete Review Route
router.delete(
    "/:reviewId", 
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destoryReview)
);

module.exports = router;