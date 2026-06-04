import { Schema, model } from "mongoose";

const CircleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: String,

    image: String,

    creator: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
    },

    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],

    moderators: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],

    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    activities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Activity",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("Circle", CircleSchema);