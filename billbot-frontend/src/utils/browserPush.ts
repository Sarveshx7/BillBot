export const isPushSupported = (): boolean => {
  return typeof window !== "undefined" && "Notification" in window;
};

export const getPushPermission = (): NotificationPermission => {
  if (!isPushSupported()) return "denied";
  return Notification.permission;
};

export const requestPushPermission = async (): Promise<boolean> => {
  if (!isPushSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (err) {
    console.error("Failed to request notification permission", err);
    return false;
  }
};

export const sendBrowserNotification = (
  title: string,
  options?: NotificationOptions
): boolean => {
  if (!isPushSupported() || Notification.permission !== "granted") {
    return false;
  }

  try {
    new Notification(title, {
      icon: "/favicon.ico",
      ...options,
    });
    return true;
  } catch (err) {
    console.error("Failed to display notification", err);
    return false;
  }
};