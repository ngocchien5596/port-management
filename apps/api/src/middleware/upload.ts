import multer from 'multer';

// Use memory storage to access file buffer directly for processing
const storage = multer.memoryStorage();

// Filter for Excel files
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
