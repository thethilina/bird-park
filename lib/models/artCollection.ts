import { Schema, model , models } from "mongoose";

const CollectionSchema = new Schema(
  {
    title: String,

    description: String,

    author: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
    },

    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    coverImage: String,

    top3Emotions: [
      {
        emotion: String,
        score: Number,
      },
    ],

    artistCategory: String,
  },
  {
    timestamps: true,
  }
);

const artCollection = models.artCollection || model("artCollection", CollectionSchema);


export default artCollection;