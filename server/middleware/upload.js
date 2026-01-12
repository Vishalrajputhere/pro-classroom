const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowed =
      file.mimetype === "application/pdf" ||
      file.mimetype === "text/plain";

    if (!allowed) {
      return cb(new Error("Only PDF or TXT files allowed"), false);
    }

    cb(null, true);
  },
});

module.exports = upload;
