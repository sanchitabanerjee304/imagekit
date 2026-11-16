const express = require("express");
const router = express.Router();

const {
    createImage,
    getImages,
    deleteImage
} = require("../controllers/image.controller");

const upload = require("../middleware/upload.middleware");

router.post("/", upload.single("image"), createImage);
router.get("/", getImages);
router.delete("/:id", deleteImage);

module.exports = router;