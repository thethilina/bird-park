import { Schema, model, models } from "mongoose";

const CircleSchema = new Schema(
  {
    name: { type: String, required: true },

    description: String,

    image: String,

    creator: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },

    // 👑 ownership system (important upgrade)
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },

    admins: [
      { type: Schema.Types.ObjectId, ref: "Artist" },
    ],

    moderators: [
      { type: Schema.Types.ObjectId, ref: "Artist" },
    ],

    members: [
      { type: Schema.Types.ObjectId, ref: "Artist" },
    ],

    // 🔥 JOIN CONTROL SYSTEM (IMPORTANT)
    joinType: {
      type: String,
      enum: ["open", "approval"],
      default: "open",
    },

    joinRequests: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "Artist",
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // 🧠 RULES SYSTEM (your idea)
    rules: [
      {
        title: String,
        description: String,
      },
    ],

    // 🎯 CATEGORY SYSTEM
    category: String,

    categoryHistory: [
      {
        category: String,
        from: Date,
        to: Date,
      },
    ],

    // 🎭 EMOTION SYSTEM (your strongest idea)
    topEmotions: [
      {
        emotion: String,
        score: Number,
      },
    ],

    emotionHistory: [
      {
        emotions: [
          {
            emotion: String,
            score: Number,
          },
        ],
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    reports: [
      {
        post: {
          type: Schema.Types.ObjectId,
          ref: "Post",
        },
        reporter: {
          type: Schema.Types.ObjectId,
          ref: "Artist",
        },
        reason: String,
        status: {
          type: String,
          enum: ["pending", "resolved"],
          default: "pending",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Circle =
  models.Circle || model("Circle", CircleSchema);

export default Circle;