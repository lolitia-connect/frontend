import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
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
  return (
    <div className="space-y-3">
      {email && (
        <Tabs
          onValueChange={(value) => {
            setValue(passwordName, "");
            setValue("current_code", "");
            clearErrors([passwordName, "current_code"]);
            onVerifyByChange(value as VerifyBy);
          }}
          value={verifyBy}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">
              {t("currentCredential.password", "Current password")}
            </TabsTrigger>
            <TabsTrigger value="code">
              {passwordName === "old_password"
                ? t("currentCredential.noPassword", "No password set")
                : t("currentCredential.verificationCode", "Verification code")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      {verifyBy === "code" && email ? (
        <FormField
          control={control}
          name="current_code"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex gap-2">
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
                  <SendCode params={{ email, type: 2 }} type="email" />
                </div>
              </FormControl>
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
      )}
    </div>
  );
}
