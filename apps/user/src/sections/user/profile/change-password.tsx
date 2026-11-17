"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { updateUserPassword } from "@workspace/ui/services/user/user";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { useGlobalStore } from "@/stores/global";
import { Logout } from "@/utils/common";
import CurrentCredentialFields, {
  type VerifyBy,
} from "./current-credential-fields";

export default function ChangePassword() {
  const { t } = useTranslation("profile");
  const [loading, setLoading] = useState(false);
  const { user } = useGlobalStore();
  const email = user?.auth_methods?.find(
    (method) => method.auth_type === "email"
  )?.auth_identifier;
  const [verifyBy, setVerifyBy] = useState<VerifyBy>("password");
  const FormSchema = z
    .object({
      old_password: z.string().optional(),
      current_code: z.string().optional(),
      password: z
        .string()
        .min(
          8,
          t(
            "accountSettings.passwordLength",
            "Password must be 8-128 characters"
          )
        )
        .max(
          128,
          t(
            "accountSettings.passwordLength",
            "Password must be 8-128 characters"
          )
        ),
      repeat_password: z.string(),
    })
    .refine((data) => data.password === data.repeat_password, {
      message: t("accountSettings.passwordMismatch", "Passwords do not match"),
      path: ["repeat_password"],
    });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      repeat_password: "",
      old_password: "",
      current_code: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (loading) return;
    const credential =
      verifyBy === "code" && email ? "current_code" : "old_password";
    if (email && !data[credential]) {
      form.setError(credential, {
        message: t(
          "currentCredential.required",
          "Verify your current credentials"
        ),
      });
      return;
    }
    setLoading(true);
    try {
      await updateUserPassword({
        password: data.password,
        [credential]: data[credential] || undefined,
      });
      toast.success(
        t("currentCredential.signInAgain", "Updated. Please sign in again.")
      );
      form.reset();
      Logout();
    } catch {
      return;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="min-w-80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {t("accountSettings.accountSettings", "Password Settings")}
          <Button
            disabled={loading}
            form="password-form"
            size="sm"
            type="submit"
          >
            {t("accountSettings.updatePassword", "Update Password")}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            id="password-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <CurrentCredentialFields
              email={email}
              hint={t(
                "currentCredential.firstPassword",
                "Leave empty when setting your first password."
              )}
              onVerifyByChange={setVerifyBy}
              passwordName="old_password"
              verifyBy={verifyBy}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "accountSettings.newPasswordHint",
                        "New Password (at least 8 characters)"
                      )}
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repeat_password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "accountSettings.repeatNewPassword",
                        "Repeat New Password"
                      )}
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
