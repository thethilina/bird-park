import { Schema, model } from "mongoose";

const ArtistInsightSchema = new Schema({
  artist: {
    type: Schema.Types.ObjectId,
    ref: "Artist",
  },

  category: String,

  top3Emotions: [
    {
      emotion: String,
      score: Number,
    },
  ],

  confidence: Number,

  sourcePosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],

  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default model(
  "ArtistInsight",
  ArtistInsightSchema
);