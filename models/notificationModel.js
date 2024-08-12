
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String }, 
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Inactive',
  },
  count: { type: Number, default: 0 }, 
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
