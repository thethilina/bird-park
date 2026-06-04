import { Schema, model } from "mongoose";

const ReplySchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "Artist",
  },

  body: String,

  mentionedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Artist",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CommentSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
    },

    body: String,

    replies: [ReplySchema],
  },
  {
    timestamps: true,
  }
);

export default model("Comment", CommentSchema);