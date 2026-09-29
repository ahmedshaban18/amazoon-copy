import express from 'express';
import multer from 'multer';
import { isAuth, isAdmin } from '../utils.js';
import Image from '../models/imageModel.js';

const storage = multer.memoryStorage(); // نخزن الصورة في الذاكرة
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter(req, file, cb) {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP are allowed.'));
    }
  },
});

const imageRouter = express.Router();

// API لرفع صورة
imageRouter.post(
  '/',
  isAuth,
  isAdmin,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
      }

      const newImage = new Image({
        data: req.file.buffer,
        contentType: req.file.mimetype,
      });

      const savedImage = await newImage.save();

      // نرجع رابط API للعرض
      res.status(201).send({
        image: `/api/images/${savedImage._id}`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Error uploading image' });
    }
  }
);

// API لعرض صورة
imageRouter.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).send({ message: 'Image not found' });
    }
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error fetching image' });
  }
});

export default imageRouter;
