import mongoose, { Schema, model, models } from 'mongoose';

const PortfolioSchema = new Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  contentHash: {
    type: String,
    unique: true,
    index: true,
  },
  data: {
    name: String,
    title: String,
    bio: String,
    skills: [String],
    socials: [{ platform: String, url: String }],
    stats: [{ label: String, value: String }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customNodes: [Schema.Types.Mixed],
    processedImage: String, // Base64 string (compressed)
    colorTheme: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Portfolio = models.Portfolio || model('Portfolio', PortfolioSchema);

export default Portfolio;
