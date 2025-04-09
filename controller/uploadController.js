const fs = require("fs");
const path = require("path");
const generateHexCode = require("../utils/hexGenerator");

const uploadImage = (req, res) => {
  try {
    // Проверяем наличие поля hexCode или генерируем новый
    const hexCode = req.body.hexCode || generateHexCode();
    const image = req.file;

    if (!image) {
      return res.status(400).json({ error: "Файл не найден" });
    }

    // Формируем пути
    const folder1 = hexCode.substring(0, 2);
    const folder2 = hexCode.substring(2, 4);

    const targetFolder = path.join(__dirname, "../uploads/images", folder1, folder2);
    const targetPath = path.join(targetFolder, image.filename);

    // Создаем недостающие директории
    fs.mkdirSync(targetFolder, { recursive: true });

    // Перемещаем файл
    fs.renameSync(image.path, targetPath);

    // Формируем относительный путь для ответа
    const dbPath = `uploads/images/${folder1}/${folder2}/${image.filename}`;

    // Возвращаем успешный ответ с путем к файлу
    res.status(200).json({ message: "Файл загружен", path: dbPath });
  } catch (error) {
    console.error("Ошибка при обработке файла:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

module.exports = { uploadImage };