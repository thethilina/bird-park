import { Schema, model, Types, models } from "mongoose";
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

 
    
     observers: [
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

const Artist = models.Artist || model("Artist", ArtistSchema);

export default Artist;