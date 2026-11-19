"use client";

import ChangePassword from "./change-password";
import NotifySettings from "./notify-settings";
import ThirdPartyAccounts from "./third-party-accounts";

export default function Profile() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ThirdPartyAccounts />
      <NotifySettings />
      <div className="lg:col-span-2">
        <ChangePassword />
      </div>
    </div>
  );
}
