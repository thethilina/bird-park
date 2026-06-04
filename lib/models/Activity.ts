import { Schema, model } from "mongoose";

const SubmissionSchema = new Schema({
  artist: {
    type: Schema.Types.ObjectId,
    ref: "Artist",
  },

  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },

  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const ActivitySchema = new Schema(
  {
    circle: {
      type: Schema.Types.ObjectId,
      ref: "Circle",
    },

    creator: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
    },

    title: String,

    description: String,

    type: {
      type: String,
      enum: [
        "same_prompt",
        "emotional_echo",
        "art_conversation",
      ],
    },

    prompt: String,

    emotion: String,

    targetPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },

    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],

    submissions: [SubmissionSchema],

    startDate: Date,

    endDate: Date,
  },
  {
    timestamps: true,
  }
);

export default model("Activity", ActivitySchema);