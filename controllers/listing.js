
const Listing = require("../models/listing");

const { geocoding, config } = require("@maptiler/client");

config.apiKey = process.env.MAP_TOKEN;


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("Listings/index.ejs", { allListings });
}


module.exports.renderNewForm = (req, res) => {
    res.render("Listings/new.ejs");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("Listings/edit.ejs", { listing });
};


module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    console.log(listing);

    res.render("Listings/show.ejs", { listing });
}


module.exports.createListing = async (req, res) => {

    // MAPTILER GEOCODING
    const result = await geocoding.forward(
        req.body.listing.location,
        {
            limit: 1
        }
    );

    console.log("GEOCODING RESULT:", result);

    // If location is not found
    if (!result.features || result.features.length === 0) {
        req.flash("error", "Location not found!");
        return res.redirect("/listings/new");
    }

    // Get coordinates from MapTiler
    console.log(
        "COORDINATES:",
        result.features[0].geometry.coordinates
    );

    // CLOUDINARY IMAGE
    let url = req.file.path;
    let filename = req.file.filename;

    console.log("IMAGE URL:", url);
    console.log("IMAGE FILENAME:", filename);

    // Create new listing
    const newListing = new Listing(req.body.listing);

    // Owner
    newListing.owner = req.user._id;

    // Cloudinary image
    newListing.image = {
        url: url,
        filename: filename
    };

    // MapTiler coordinates
    newListing.geometry = result.features[0].geometry;

    // Save listing
    await newListing.save();

    console.log("LISTING SAVED:", newListing);

    req.flash("success", "New Listing created!");

    res.redirect("/listings");
};
module.exports.updateListing = async (req, res) => {

    let { id } = req.params;

    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    listing.set(req.body.listing);

    // Update MapTiler coordinates
    if (req.body.listing.location) {

        const result = await geocoding.forward(
            req.body.listing.location,
            {
                limit: 1
            }
        );

        if (!result.features || result.features.length === 0) {
            req.flash("error", "Location not found!");
            return res.redirect(`/listings/${id}/edit`);
        }

        listing.geometry = result.features[0].geometry;
    }

    // Update image
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();

    req.flash("success", "Listing updated!");

    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) => {

    let { id } = req.params;

    let deletedListing = await Listing.findByIdAndDelete(id);

    console.log(deletedListing);

    req.flash("success", "Listing Deleted!");

    res.redirect("/listings");
}