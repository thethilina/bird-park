import { Schema, model , models } from "mongoose";

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

    body: {
      type: String,
    },

    // Cloudinary asset
    media: {
      url: String,
      publicId: String,
      type: {
        type: String, // image | video
      },
    },

    // Poem styling (ONLY used when type = poem)
    poemStyle: {
      fontFamily: String,
      fontSize: String,
      fontColor: String,
      backgroundColor: String,
    },

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

    circle: {
  type: Schema.Types.ObjectId,
  ref: "Circle",
  default: null,
},

    visibility: {
      type: String,
      enum: ["public", "circle"],
      default: "public",
    },
  },
  {
    timestamps: true,
  }
);

const Post = models.Post || model("Post", PostSchema);


export default Post;

