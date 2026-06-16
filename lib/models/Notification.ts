import { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
    },

    type: {
      type: String,
      enum: [
        "connection_request",
        "connection_accepted",

        "comment",
        "reply",

        "heart",

        "circle_join_request",
        "circle_join_approved",

        "activity_submission",

        "system"
      ],
      required: true,
    },

    message: String,

    entityId: Schema.Types.ObjectId,

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification =
  models.Notification ||
  model("Notification", NotificationSchema);

export default Notification;