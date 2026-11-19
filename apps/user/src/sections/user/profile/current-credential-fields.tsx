"use client";

import {
  TabIndicator,
  TabPanel,
  Tabs,
  TabList as TabsList,
  TabListContainer as TabsListContainer,
  Tab as TabsTrigger,
} from "@heroui/react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import SendCode from "@/sections/auth/send-code";

export type VerifyBy = "password" | "code";

interface CurrentCredentialFieldsProps {
  email?: string;
  hint?: string;
  onVerifyByChange: (value: VerifyBy) => void;
  passwordName: "password" | "old_password";
  verifyBy: VerifyBy;
}

export default function CurrentCredentialFields({
  email,
  hint,
  onVerifyByChange,
  passwordName,
  verifyBy,
}: CurrentCredentialFieldsProps) {
  const { t } = useTranslation("profile");
  const { control, setValue, clearErrors } = useFormContext();
  const fields =
    verifyBy === "code" && email ? (
      <FormField
        control={control}
        name="current_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only">
              {t("currentCredential.code", "Code sent to {{email}}", { email })}
            </FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  autoComplete="one-time-code"
                  placeholder={t(
                    "currentCredential.code",
                    "Code sent to {{email}}",
                    { email }
                  )}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <SendCode params={{ email, type: 2 }} type="email" />
            </div>
            {passwordName === "old_password" && (
              <FormDescription>
                {t(
                  "currentCredential.firstPasswordCode",
                  "Use a verification code only if you have not set a password. Otherwise, enter your current password."
                )}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    ) : (
      <FormField
        control={control}
        name={passwordName}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only">
              {t("currentCredential.password", "Current password")}
            </FormLabel>
            <FormControl>
              <Input
                autoComplete="current-password"
                placeholder={t(
                  "currentCredential.password",
                  "Current password"
                )}
                type="password"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            {!email && hint && <FormDescription>{hint}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );

  if (!email) return <div className="space-y-3">{fields}</div>;

  return (
    <Tabs
      className="min-w-0 max-w-full space-y-3"
      onSelectionChange={(key) => {
        setValue(passwordName, "");
        setValue("current_code", "");
        clearErrors([passwordName, "current_code"]);
        onVerifyByChange(String(key) as VerifyBy);
      }}
      selectedKey={verifyBy}
    >
      <TabsListContainer className="min-w-0 max-w-full">
        <TabsList aria-label={t("sections", "Sections")}>
          <TabsTrigger
            className="w-auto flex-1 whitespace-nowrap"
            id="password"
          >
            {t("currentCredential.password", "Current password")}
            <TabIndicator />
          </TabsTrigger>
          <TabsTrigger className="w-auto flex-1 whitespace-nowrap" id="code">
            {passwordName === "old_password"
              ? t("currentCredential.noPassword", "No password set")
              : t("currentCredential.verificationCode", "Verification code")}
            <TabIndicator />
          </TabsTrigger>
        </TabsList>
      </TabsListContainer>
      <TabPanel id="password">
        {verifyBy === "password" ? fields : null}
      </TabPanel>
      <TabPanel id="code">{verifyBy === "code" ? fields : null}</TabPanel>
    </Tabs>
  );
}
