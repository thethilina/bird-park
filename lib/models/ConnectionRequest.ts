import { Schema, model, models } from "mongoose";

const ConnectionRequestSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

ConnectionRequestSchema.index(
  {
    sender: 1,
    receiver: 1,
  },
  {
    unique: true,
  }
);

const ConnectionRequest =
  models.ConnectionRequest ||
  model(
    "ConnectionRequest",
    ConnectionRequestSchema
  );

export default ConnectionRequest;