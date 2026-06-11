import { Schema, model, models } from "mongoose";

const CommentSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
    },

    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    mentionedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Comment =
  models.Comment ||
  model("Comment", CommentSchema);

export default Comment;