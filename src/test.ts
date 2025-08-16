import pushNotificationService from "./services/push-notification.service";

const main = async () => {
  const userId = "a1e6f829-aaad-42f5-ab4b-b00b261ba255";
  const userType = "advisor";

  await pushNotificationService.sendToUser(userId, userType, {
    title: "This is a test notification 2",
    body: "This is the body of notification 2",
  });
};

main()
  .then(() => {
    console.log("Notification Sent");
  })
  .catch((err) => {
    console.error("Failed to send notification.", err);
  });
