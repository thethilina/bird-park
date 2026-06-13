import { Schema, model, models } from "mongoose";

const SharedPromptActivitySchema = new Schema(
  {
    circle: {
      type: Schema.Types.ObjectId,
      ref: "Circle",
      required: true,
    },

    creator: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    prompt: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    submissions: [
      {
        artist: {
          type: Schema.Types.ObjectId,
          ref: "Artist",
          required: true,
        },
        post: {
          type: Schema.Types.ObjectId,
          ref: "Post",
          required: true,
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const SharedPromptActivity =
  models.SharedPromptActivity ||
  model("SharedPromptActivity", SharedPromptActivitySchema);

export default SharedPromptActivity;