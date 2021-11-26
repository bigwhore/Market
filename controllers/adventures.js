const Adventure = require('../models/listings');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const MapboxClient = require('@mapbox/mapbox-sdk');
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');
const mapboxgl = require('mapbox-gl');
const User = require('../models/user');
const Review = require('../models/review');



module.exports.index = async (req, res) => {
    const adventures = await Adventure.find({});
    res.render('adventures', { adventures })
};

module.exports.renderNewForm = (req, res) => {
    res.render('adventures/new')
};

module.exports.createAdventure = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.adventure.location,
        limit: 1
    }).send()
    const adventure = new Adventure(req.body.adventure);
    adventure.geometry = geoData.body.features[0].geometry;
    adventure.images = req.files.map(f => ({ url: f.path, filename: f.filename}));
    adventure.author = req.user._id;
    console.log(adventure);
    await adventure.save();
    req.flash('success', 'Successfully made adventure');
    res.redirect(`/adventures/${adventure._id}`)
};

module.exports.showAdventure = async (req, res) => {
    const adventures = await Adventure.find({});
    const adventure = await Adventure.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path:'author'
        }
    }).populate('author');
    if (!adventure) {
        req.flash('error', 'Cannot find that campground!');
        return  res.redirect('/adventures');
    }
    res.render('show', { adventure, adventures })
};

module.exports.renderEditForm = async (req, res) => {
    const adventure = await Adventure.findById(req.params.id);
    res.render('adventures/edit', { adventure });
};

module.exports.updateAdventure = async (req, res) => {
    const { id } = req.params;
    const adventure = await Adventure.findByIdAndUpdate(id, { ...req.body.adventure });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    adventure.images.push(...imgs);
    await adventure.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await adventure.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated Adventure!');
    res.redirect(`/adventures/${adventure._id}`)
};

module.exports.deleteAdventure = async (req, res) => {
    const { id } = req.params;
    await Adventure.findByIdAndDelete(id);
    res.redirect('/adventures');
};

module.exports.admin = async (req, res) => {
    const adventures = await Adventure.find({});
    res.render('admin', { adventures });
};

