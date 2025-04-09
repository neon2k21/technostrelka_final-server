const express = require("express");
const multer = require("multer");
const { uploadImage } = require("../controller/uploadController");
const path = require("path");
const fs = require("fs");

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../uploads/images");

    // Создаем базовую директорию, если она не существует
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

// Маршрут для загрузки файла
router.post("/upload", upload.single("image"), (req, res) => {
  uploadImage(req, res);
});

module.exports = router;