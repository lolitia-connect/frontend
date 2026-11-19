"use client";

import {
  AlertDialog,
  Button,
  Description,
  ErrorMessage,
  Spinner,
} from "@heroui/react";
import type React from "react";
import { type ReactNode, useState } from "react";

interface ConfirmationButtonProps {
  cancelText?: string;
  confirmText?: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  title: string;
  trigger: ReactNode;
}

export const ConfirmButton: React.FC<ConfirmationButtonProps> = ({
  trigger,
  title,
  description,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Confirm",
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  return (
    <AlertDialog>
      {trigger}
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
              <Description>{description}</Description>
            </AlertDialog.Header>
            {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
            <AlertDialog.Footer>
              <Button isDisabled={loading} slot="close" variant="secondary">
                {cancelText}
              </Button>
              <Button
                isPending={loading}
                onPress={async () => {
                  if (loading) return;
                  setLoading(true);
                  setError(undefined);
                  try {
                    await onConfirm();
                  } catch (error) {
                    setError(
                      error instanceof Error ? error.message : String(error)
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading && <Spinner size="sm" />}
                {confirmText}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
};
