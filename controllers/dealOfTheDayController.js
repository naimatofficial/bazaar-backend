
import mongoose from 'mongoose';
import DealOfTheDay from '../models/dealOfTheDayModel.js';
import Product from '../models/ProductModels.js';



// Create a Deal of the Day
export const createDealOfTheDay = async (req, res) => {
    try {
        const { productId, title } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        console.log("product=======", product);

        const newDeal = new DealOfTheDay({ productId, title });
        await newDeal.save();

        const populatedDeal = await newDeal.populate({
            path: 'productId',
            select: 'name price description thumbnail category' // Specify the fields to return
        });

        res.status(201).json({ message: 'Deal of the Day created successfully', dealOfTheDay: populatedDeal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all Deals of the Day
export const getAllDealsOfTheDay = async (req, res) => {
    try {
        const deals = await DealOfTheDay.find().populate({
            path: 'productId',
            select: 'name price description thumbnail category', // Specify the fields to return
        });
        res.status(200).json(deals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Deal of the Day by ID
export const getDealOfTheDayById = async (req, res) => {
    try {
        const { id } = req.params;
        const deal = await DealOfTheDay.findById(id).populate({
            path: 'productId',
            select: 'name price description image'
        });

        if (!deal) {
            return res.status(404).json({ message: 'Deal of the Day not found' });
        }

        res.status(200).json(deal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Deal of the Day
export const updateDealOfTheDay = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedDeal = await DealOfTheDay.findByIdAndUpdate(id, req.body, 
            { new: true });

        if (!updatedDeal) {
            return res.status(404).json({ message: 'Deal of the Day not found' });
        }

        res.status(200).json({ message: 'Deal of the Day updated successfully', dealOfTheDay: updatedDeal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Deal of the Day
export const deleteDealOfTheDay = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDeal = await DealOfTheDay.findByIdAndDelete(id);

        if (!deletedDeal) {
            return res.status(404).json({ message: 'Deal of the Day not found' });
        }

        res.status(200).json({ message: 'Deal of the Day deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update the status of a Deal of the Day
export const updateDealOfTheDayStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedDeal = await DealOfTheDay.findByIdAndUpdate(id, { status }, { new: true });

        if (!updatedDeal) {
            return res.status(404).json({ message: 'Deal of the Day not found' });
        }

     
        res.status(200).json({ message: 'Deal of the Day status updated successfully', dealOfTheDay: updatedDeal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
