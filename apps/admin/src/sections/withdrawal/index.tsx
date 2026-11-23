"use client";

import { Description, Modal, toast } from "@heroui/react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { ConfirmButton } from "@workspace/ui/composed/confirm-button";
import {
  ProTable,
  type ProTableActions,
} from "@workspace/ui/composed/pro-table/pro-table";
import { useSearch } from "@workspace/ui/lib/router-compat";
import {
  getWithdrawalList,
  putWithdrawalStatus,
} from "@workspace/ui/services/admin/admin";
import { type FormEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { UserDetail } from "@/sections/user/user-detail";
import { formatDate } from "@/utils/common";
import { useTableSearchParams } from "@/utils/use-table-search-params";

export function ReviewActions({
  withdrawal,
  onReviewed,
}: {
  withdrawal: API.WithdrawalLog;
  onReviewed: () => void;
}) {
  const { t } = useTranslation("withdrawal");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const review = async (status: 1 | 2) => {
    if (
      submitting.current ||
      withdrawal.status !== 0 ||
      (status === 2 && !reason.trim())
    )
      return;
    submitting.current = true;
    setLoading(true);
    try {
      await putWithdrawalStatus({
        id: withdrawal.id,
        status,
        ...(status === 2 ? { reason: reason.trim() } : {}),
      });
      toast.success(
        status === 1
          ? t("approveSuccess", "Withdrawal approved")
          : t("rejectSuccess", "Withdrawal rejected")
      );
      setOpen(false);
      setReason("");
      onReviewed();
    } catch {
      return;
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };
  return (
    <div className="flex gap-2">
      <ConfirmButton
        cancelText={t("cancel", "Cancel")}
        confirmText={t("confirmApprove", "Approve")}
        description={t(
          "approveDescription",
          "Confirm that this withdrawal has been verified and can be approved."
        )}
        onConfirm={() => review(1)}
        title={t("approveTitle", "Approve this withdrawal?")}
        trigger={
          <Button disabled={loading} size="sm">
            {t("approve", "Approve")}
          </Button>
        }
      />
      <Modal
        isOpen={open}
        onOpenChange={(value) => {
          if (!loading) setOpen(value);
        }}
      >
        <Button disabled={loading} size="sm" variant="destructive">
          {t("reject", "Reject")}
        </Button>

        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <form
                onSubmit={async (event: FormEvent) => {
                  event.preventDefault();
                  await review(2);
                }}
              >
                <Modal.Header>
                  <Modal.Heading>
                    {t("rejectTitle", "Reject this withdrawal?")}
                  </Modal.Heading>
                  <Description slot="description">
                    {t(
                      "rejectDescription",
                      "The rejection reason will be recorded for this request."
                    )}
                  </Description>
                </Modal.Header>
                <div className="grid gap-2 py-4">
                  <label htmlFor={`reject-${withdrawal.id}`}>
                    {t("rejectionReason", "Rejection Reason")}
                  </label>
                  <Textarea
                    id={`reject-${withdrawal.id}`}
                    maxLength={500}
                    onChange={(event) => setReason(event.target.value)}
                    rows={4}
                    value={reason}
                  />
                </div>
                <Modal.Footer>
                  <Button
                    disabled={loading}
                    onClick={() => setOpen(false)}
                    type="button"
                    variant="outline"
                  >
                    {t("cancel", "Cancel")}
                  </Button>
                  <Button
                    disabled={!reason.trim()}
                    loading={loading}
                    type="submit"
                    variant="destructive"
                  >
                    {t("confirmReject", "Confirm Reject")}
                  </Button>
                </Modal.Footer>
              </form>
              <Modal.CloseTrigger aria-label="Close" />
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}

export default function WithdrawalPage() {
  const { t } = useTranslation("withdrawal");
  const search = useSearch({ strict: false }) as Record<
    string,
    string | undefined
  >;
  const actions = useRef<ProTableActions>(null);
  const syncFilters = useTableSearchParams(["status", "user_id"]);
  const statusOptions = [
    { label: t("status.pending", "Pending"), value: "0" },
    { label: t("status.approved", "Approved"), value: "1" },
    { label: t("status.rejected", "Rejected"), value: "2" },
  ];
  return (
    <ProTable<API.WithdrawalLog, { status?: string; user_id?: string }>
      action={actions}
      actions={{
        render: (withdrawal) =>
          withdrawal.status === 0
            ? [
                <ReviewActions
                  key={withdrawal.id}
                  onReviewed={() => actions.current?.refresh()}
                  withdrawal={withdrawal}
                />,
              ]
            : [],
      }}
      columns={[
        {
          accessorKey: "user_id",
          header: t("user", "User"),
          cell: ({ row }) => <UserDetail id={row.original.user_id} />,
        },
        {
          accessorKey: "amount",
          header: t("amount", "Amount"),
          cell: ({ row }) => (
            <Display type="currency" value={row.original.amount} />
          ),
        },
        {
          accessorKey: "content",
          header: t("withdrawalInfo", "Withdrawal Info"),
          cell: ({ row }) => (
            <div className="max-w-80 whitespace-pre-wrap break-all">
              {row.original.content}
            </div>
          ),
        },
        {
          accessorKey: "status",
          header: t("status.label", "Status"),
          cell: ({ row }) => (
            <Badge
              variant={row.original.status === 2 ? "destructive" : "secondary"}
            >
              {statusOptions.find(
                (option) => option.value === String(row.original.status)
              )?.label ?? "--"}
            </Badge>
          ),
        },
        {
          accessorKey: "reason",
          header: t("rejectionReason", "Rejection Reason"),
          cell: ({ row }) => (
            <div className="max-w-64 whitespace-pre-wrap break-words">
              {row.original.reason || "--"}
            </div>
          ),
        },
        {
          accessorKey: "created_at",
          header: t("submittedAt", "Submitted At"),
          cell: ({ row }) => formatDate(row.original.created_at),
        },
        {
          accessorKey: "updated_at",
          header: t("reviewedAt", "Reviewed At"),
          cell: ({ row }) =>
            row.original.status ? formatDate(row.original.updated_at) : "--",
        },
      ]}
      header={{ title: t("title", "Commission Management") }}
      initialFilters={{ status: search.status, user_id: search.user_id }}
      onFiltersChange={syncFilters}
      params={[
        {
          key: "status",
          options: statusOptions,
          placeholder: t("status.label", "Status"),
        },
        { key: "user_id", placeholder: t("userId", "User ID") },
      ]}
      request={async (pagination, filters) => {
        const status =
          filters.status !== undefined && filters.status !== ""
            ? Number(filters.status)
            : undefined;
        const userId = Number(filters.user_id);
        const { data } = await getWithdrawalList({
          ...pagination,
          ...([0, 1, 2].includes(status ?? -1)
            ? { status: status as 0 | 1 | 2 }
            : {}),
          ...(Number.isSafeInteger(userId) && userId > 0
            ? { user_id: userId }
            : {}),
        });
        return { list: data.data?.list || [], total: data.data?.total || 0 };
      }}
      texts={{ actions: t("actions", "Actions") }}
    />
  );
}
