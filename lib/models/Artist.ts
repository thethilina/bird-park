import { Schema, model, Types } from "mongoose";
import { ArtistCategory } from "./types";

const ArtistSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    profileImage: String,

    bio: {
      type: String,
      default: "",
    },

    birthday: Date,

    currentCategory: {
      type: String,
      enum: Object.values(ArtistCategory),
    },

    currentTop3Emotions: [
      {
        emotion: String,
        score: Number,
      },
    ],

    categoryHistory: [
      {
        category: String,
        confidence: Number,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    emotionHistory: [
      {
        emotions: [
          {
            emotion: String,
            score: Number,
          },
        ],

        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],

    connections: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],

    circles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Circle",
      },
    ],

    collections: [
      {
        type: Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("Artist", ArtistSchema);