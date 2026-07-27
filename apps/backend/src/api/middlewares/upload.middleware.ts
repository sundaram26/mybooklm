import multer from "multer";
import path from "path";
import fs from "fs";

// Set up in-memory storage
const storage = multer.memoryStorage();

// Document file filter (PDF, Word, TXT, SRT, VTT)
const documentFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/vtt",
        "application/x-subrip",
        "text/srt"
    ];
    
    // Sometimes srt/vtt have weird mime types, also checking extensions
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".srt", ".vtt"];

    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF, Word, TXT, and subtitle files are allowed.") as any, false);
    }
};

// Image file filter
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.") as any, false);
    }
};

export const documentUpload = multer({ 
    storage,
    fileFilter: documentFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export const imageUpload = multer({ 
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
