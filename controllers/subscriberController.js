import Subscriber from '../models/subscriberModel.js';



// Add a new subscriber
export const addSubscriber = async (req, res) => {
  const { email } = req.body;
  try {
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'Subscriber already exists' });
    }
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();
    res.status(201).json(newSubscriber);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all subscribers or search subscribers by email
export const getSubscribers = async (req, res) => {
    const { searchValue } = req.query;
    try {
      let subscribers;
      if (searchValue) {
        const regex = new RegExp(searchValue, 'i'); // 'i' makes the search case insensitive
        subscribers = await Subscriber.find({ email: { $regex: regex } });
      } else {
        subscribers = await Subscriber.find();
      }
      res.status(200).json(subscribers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
// Delete a subscriber by ID
export const deleteSubscriber = async (req, res) => {
  const { id } = req.params;
  try {
    const subscriber = await Subscriber.findByIdAndDelete(id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }
    res.status(200).json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

