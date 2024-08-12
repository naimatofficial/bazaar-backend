import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    hexCode: { type: String, required: true },
}, { timestamps: true });

const Color = mongoose.model('Color', colorSchema);

export default Color;
