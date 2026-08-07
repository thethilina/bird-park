import { Schema, model, models } from "mongoose";

const CircleSchema = new Schema(
  {
    name: { type: String, required: true },

    description: String,

    image: String, // cover / banner photo

    icon: String, // small circle avatar icon

    creator: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },

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

    rules: [
      {
        title: String,
        description: String,
      },
    ],

    category: String,

    categoryHistory: [
      {
        category: String,
        from: Date,
        to: Date,
      },
    ],

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