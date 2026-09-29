import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true }, // محتوى الصورة
    contentType: { type: String, required: true }, // نوع الملف (image/png, image/jpeg)
  },
  { timestamps: true }
);

const Image = mongoose.model('Image', imageSchema);
export default Image;
