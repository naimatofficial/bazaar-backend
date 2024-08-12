import Color from '../models/colorModel.js';

// Create a new color
export const createColor = async (req, res) => {
    try {
        const { name, hexCode } = req.body;
        const color = new Color({ name, hexCode });
        await color.save();
        res.status(201).json(color);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all colors
export const getColors = async (req, res) => {
    try {
        const colors = await Color.find();
        res.status(200).json(colors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single color by ID
export const getColorById = async (req, res) => {
    try {
        const color = await Color.findById(req.params.id);
        if (!color) {
            return res.status(404).json({ message: 'Color not found' });
        }
        res.status(200).json(color);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a color by ID
export const updateColor = async (req, res) => {
    try {
        const { name, hexCode } = req.body;
        const color = await Color.findByIdAndUpdate(
            req.params.id,
            { name, hexCode },
            { new: true, runValidators: true }
        );
        if (!color) {
            return res.status(404).json({ message: 'Color not found' });
        }
        res.status(200).json(color);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a color by ID
export const deleteColor = async (req, res) => {
    try {
        const color = await Color.findByIdAndDelete(req.params.id);
        if (!color) {
            return res.status(404).json({ message: 'Color not found' });
        }
        res.status(200).json({ message: 'Color deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
