import Attribute from '../models/attributeModel.js';

// Create a new attribute
export const createAttribute = async (req, res) => {
    try {
        const { name} = req.body;
        const newAttribute = new Attribute({ name });

        await newAttribute.save();
        res.status(201).json(newAttribute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get all attributes
export const getAttributes = async (req, res) => {
    try {
        const attributes = await Attribute.find();
        res.status(200).json(attributes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get an attribute by ID
export const getAttributeById = async (req, res) => {
    try {
        const attribute = await Attribute.findById(req.params.id);
        if (!attribute) {
            return res.status(404).json({ message: 'Attribute not found' });
        }
        res.status(200).json(attribute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an attribute
export const updateAttribute = async (req, res) => {
    try {
        const { name } = req.body;
        const attribute = await Attribute.findById(req.params.id);

        if (!attribute) {
            return res.status(404).json({ message: 'Attribute not found' });
        }

        attribute.type = type;
        attribute.values = values;
        await attribute.save();

        res.status(200).json(attribute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an attribute
export const deleteAttribute = async (req, res) => {
    try {
        const attribute = await Attribute.findByIdAndDelete(req.params.id);

        if (!attribute) {
            return res.status(404).json({ message: 'Attribute not found' });
        }

        res.status(200).json({ message: 'Attribute deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};






