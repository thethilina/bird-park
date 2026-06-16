import Notification from "./models/Notification";

export type NotificationType =
  | "connection_request"
  | "connection_accepted"
  | "comment"
  | "reply"
  | "heart"
  | "circle_join_request"
  | "circle_join_approved"
  | "activity_submission"
  | "system";

interface CreateNotificationParams {
  recipient: string;
  sender?: string;
  type: NotificationType;
  message: string;
  entityId?: string;
}

export default async function createNotification({
  recipient,
  sender,
  type,
  message,
  entityId,
}: CreateNotificationParams) {
  if (!recipient || !type || !message) {
    throw new Error("Notification recipient, type, and message are required");
  }

  const notification = await Notification.create({
    recipient,
    sender,
    type,
    message,
    entityId,
  });

  return notification;
}
