import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    subject: { type: String, trim: true, maxlength: 120, default: '' },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 3000 },
  },
  { timestamps: true },
);

export default mongoose.model('ContactMessage', contactMessageSchema);
