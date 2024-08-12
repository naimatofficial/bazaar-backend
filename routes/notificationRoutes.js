import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  searchNotifications,
  incrementNotificationCount,
} from '../controllers/notificationController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); 
  }
});

const upload = multer({ storage });

const router = express.Router();

router.get('/', getAllNotifications);
router.get('/search', searchNotifications);
router.get('/:id', getNotificationById);
router.post('/', upload.single('image'), createNotification);
router.put('/:id', upload.single('image'), updateNotification);
router.put('/:id/increment', incrementNotificationCount);
router.delete('/:id', deleteNotification);

export default router;
