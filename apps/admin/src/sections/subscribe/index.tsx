"use client";

import { useTranslation } from "react-i18next";
import ConfigForm from "./config-form";
import { ProtocolForm } from "./protocol-form";

export default function Subscribe() {
  const { t } = useTranslation("subscribe");

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">
        {t("config.title", "Subscription Configuration")}
      </h2>
      <ConfigForm />

      <ProtocolForm />
    </div>
  );
}
