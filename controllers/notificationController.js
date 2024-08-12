import Notification from '../models/notificationModel.js';

// Get all notifications
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search notifications
export const searchNotifications = async (req, res) => {
  const { query } = req.query; // Search query parameter

  try {
    const notifications = await Notification.find({
      $or: [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') }
      ]
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a notification by ID
export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  const { title, description, userLimit, status } = req.body;
  const image = req.file ? req.file.path : ''; // Get the image path from the request

  try {
    const newNotification = new Notification({
      title,
      description,
      image,
      
      status,
    });
    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing notification
export const updateNotification = async (req, res) => {
  const { title, description, userLimit, status } = req.body;
  const image = req.file ? req.file.path : ''; // Get the image path from the request

  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { title, description, image, status },
      { new: true }
    );
    if (!updatedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Increment notification count
export const incrementNotificationCount = async (req, res) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $inc: { count: 1 } }, // Increment the count field
      { new: true }
    );
    if (!updatedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
