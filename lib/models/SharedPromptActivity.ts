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

    activityType: {
      type: String,
      enum: ["art_jam", "prompt_battle"],
      default: "art_jam",
    },

    coverImage: {
      type: String,
    },


    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    // Art Jam: single prompt
    prompt: {
      type: String,
    },

    // Prompt Battle: two opposing prompts
    promptA: {
      type: String,
    },

    promptB: {
      type: String,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    maxParticipants: {
      type: Number,
      default: null,
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
        // For Prompt Battle: which prompt the artist chose
        chosenPrompt: {
          type: String,
          enum: ["A", "B", null],
          default: null,
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    topEmotions: [
      {
        emotion: String,
        score: Number,
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