import { Schema, model, Types } from "mongoose";

interface IEmotionHistory {
  emotions: string[];
  date: Date;
}

interface ICategoryHistory {
  category: string;
  confidence: number;
  date: Date;
}

export interface IArtist {
  username: string;
  fullName: string;
  email: string;
  password: string;

  profileImage?: string;
  bio?: string;

  birthday?: Date;

  currentCategory?: string;
  currentTop3Emotions?: string[];

  categoryHistory: ICategoryHistory[];
  emotionHistory: IEmotionHistory[];

  followers: Types.ObjectId[];
  connections: Types.ObjectId[];

  circles: Types.ObjectId[];
  collections: Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
}


const ArtistSchema = new Schema<IArtist>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
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

    currentCategory: String,

    currentTop3Emotions: [String],

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
        emotions: [String],
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

export default model<IArtist>("Artist", ArtistSchema);  