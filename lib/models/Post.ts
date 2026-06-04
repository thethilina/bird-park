import { Schema, model } from "mongoose";

const PostSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },

    type: {
      type: String,
      enum: ["art", "poem"],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    body: String,

    image: String,

    hearts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],

    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    collection: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },

    top3Emotions: [
      {
        emotion: String,
        score: Number,
      },
    ],

    visibility: {
   type: String,
   enum:["public","circle"],
   default:"public"
}
  },
  {
    timestamps: true,
  }
);

export default model("Post", PostSchema);

