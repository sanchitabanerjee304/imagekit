
const Image = require("../models/image.model");
const imagekit = require("../config/imagekit");

// ==================================
// 1. UPLOAD IMAGE
// ==================================

const createImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image"
            });
        }

        // Upload image to ImageKit
        const uploadedImage = await imagekit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname,
            folder: "/imagekit-project"
        });

        // Save image details in MongoDB
        const image = await Image.create({
            name: req.file.originalname,
            imageUrl: uploadedImage.url,
            publicId: uploadedImage.fileId,
            size: uploadedImage.size,
            format: req.file.mimetype.split("/")[1]
        });

        return res.status(201).json({
            success: true,
            message: "Image uploaded successfully!",
            image
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==================================
// 2. GET ALL IMAGES
// ==================================

const getImages = async (req, res) => {
    try {
        const images = await Image.find().sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            images
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==================================
// 3. DELETE IMAGE
// ==================================

const deleteImage = async (req, res) => {
    try {
        // Find image using MongoDB ID
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Image not found"
            });
        }

        // Delete actual image from ImageKit
        await imagekit.deleteFile(image.publicId);

        // Delete image record from MongoDB
        await Image.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Image deleted successfully from ImageKit and MongoDB"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==================================
// EXPORT ALL FUNCTIONS
// ==================================

module.exports = {
    createImage,
    getImages,
    deleteImage
};
