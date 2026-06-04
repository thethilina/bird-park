import { Schema, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
    },

    type: {
      type: String,
      required: true,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model(
  "Notification",
  NotificationSchema
);