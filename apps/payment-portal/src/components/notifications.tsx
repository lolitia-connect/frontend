import { Toast, toast } from "@heroui/react";
import { useEffect, useRef } from "react";
import { toast as requestToast, useSonner } from "sonner";

export function Notifications() {
  const { toasts } = useSonner();
  const forwarded = useRef(new Set<string | number>());

  // Shared API services publish errors through Sonner; render them with HeroUI
  // without mounting Sonner's legacy Toaster or changing the other applications.
  useEffect(() => {
    for (const notification of toasts) {
      if (notification.delete || forwarded.current.has(notification.id))
        continue;
      forwarded.current.add(notification.id);
      const title =
        typeof notification.title === "function"
          ? notification.title()
          : notification.title;
      const description =
        typeof notification.description === "function"
          ? notification.description()
          : notification.description;
      toast(title, {
        description,
        variant: notification.type === "error" ? "danger" : "default",
      });
      requestToast.dismiss(notification.id);
    }
  }, [toasts]);

  return <Toast.Provider placement="top end" />;
}
