
const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ""
        },
        imageUrl: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        size: {
            type: Number
        },
        format: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
