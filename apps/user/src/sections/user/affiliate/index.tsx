"use client";

import { Card, Description, Modal } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";

import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { ProList } from "@workspace/ui/composed/pro-list/pro-list";
import {
  postV1PublicUserCommissionWithdraw as commissionWithdraw,
  getV1PublicUserAffiliateCount as queryUserAffiliate,
  getV1PublicUserAffiliateList as queryUserAffiliateList,
} from "@workspace/ui/services/user/user";
import { formatDate } from "@workspace/ui/utils/formatting";
import { Copy } from "lucide-react";
import { type FormEvent, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Display } from "@/components/display";
import { useGlobalStore } from "@/stores/global";

export default function Affiliate() {
  const { t } = useTranslation("affiliate");
  const { user, common, getUserInfo } = useGlobalStore();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawContent, setWithdrawContent] = useState("");
  const { data, refetch } = useQuery({
    queryKey: ["queryUserAffiliate"],
    queryFn: async () => {
      const response = await queryUserAffiliate();
      return response.data.data;
    },
  });
  const availableCommission = user?.commission ?? data?.total_commission ?? 0;
  const withdrawMutation = useMutation({
    mutationFn: commissionWithdraw,
    onSuccess: async () => {
      toast.success(t("withdrawSuccess", "Withdrawal request submitted"));
      setWithdrawAmount("");
      setWithdrawContent("");
      setWithdrawOpen(false);
      await Promise.all([refetch(), getUserInfo()]);
    },
    onError: () => {
      toast.error(t("withdrawFailed", "Failed to submit withdrawal request"));
    },
  });

  const handleWithdraw = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(withdrawAmount);
    const content = withdrawContent.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t("invalidWithdrawAmount", "Please enter a valid amount"));
      return;
    }

    if (amount > availableCommission) {
      toast.error(
        t("withdrawAmountExceeds", "Amount exceeds available commission")
      );
      return;
    }

    if (!content) {
      toast.error(t("withdrawContentRequired", "Please enter withdrawal info"));
      return;
    }

    withdrawMutation.mutate({
      amount,
      content,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <Card.Header>
          <Card.Title>{t("totalCommission", "Total Commission")}</Card.Title>
          <Card.Description>
            {t("commissionInfo", "Commission Info")}
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-3xl">
                <Display type="currency" value={data?.total_commission} />
              </span>
              <span className="text-muted text-sm">
                ({t("commissionRate", "Commission Rate")}:{" "}
                {user?.referral_percentage ||
                  common?.invite?.referral_percentage}
                %)
              </span>
            </div>
            <Modal isOpen={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <Button disabled={availableCommission <= 0}>
                {t("withdraw", "Withdraw")}
              </Button>

              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog>
                    <form onSubmit={handleWithdraw}>
                      <Modal.Header>
                        <Modal.Heading>
                          {t("withdrawCommission", "Withdraw Commission")}
                        </Modal.Heading>
                        <Description slot="description">
                          {t(
                            "withdrawDescription",
                            "Submit a commission withdrawal request for admin review."
                          )}
                        </Description>
                      </Modal.Header>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label
                            className="font-medium text-sm"
                            htmlFor="amount"
                          >
                            {t("withdrawAmount", "Withdrawal Amount")}
                          </label>
                          <Input
                            id="amount"
                            min="0"
                            onChange={(event) =>
                              setWithdrawAmount(event.target.value)
                            }
                            placeholder={t(
                              "withdrawAmount",
                              "Withdrawal Amount"
                            )}
                            step="0.01"
                            type="number"
                            value={withdrawAmount}
                          />
                          <p className="text-muted text-sm">
                            {t("availableCommission", "Available Commission")}:{" "}
                            <Display
                              type="currency"
                              value={availableCommission}
                            />
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <label
                            className="font-medium text-sm"
                            htmlFor="content"
                          >
                            {t("withdrawInfo", "Withdrawal Info")}
                          </label>
                          <Textarea
                            id="content"
                            onChange={(event) =>
                              setWithdrawContent(event.target.value)
                            }
                            placeholder={t(
                              "withdrawInfoPlaceholder",
                              "Enter payment account or withdrawal instructions"
                            )}
                            value={withdrawContent}
                          />
                        </div>
                      </div>
                      <Modal.Footer>
                        <Button
                          disabled={withdrawMutation.isPending}
                          type="submit"
                        >
                          {withdrawMutation.isPending
                            ? t("submitting", "Submitting...")
                            : t("submitWithdraw", "Submit Withdrawal")}
                        </Button>
                      </Modal.Footer>
                    </form>
                    <Modal.CloseTrigger aria-label="Close" />
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          </div>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header className="flex flex-row items-center justify-between space-y-0">
          <Card.Title className="font-medium text-lg">
            {t("inviteCode", "Invite Code")}
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 truncate rounded bg-default px-2 py-1 font-bold text-lg sm:text-2xl">
              {user?.refer_code}
            </code>
            <CopyToClipboard
              onCopy={(_, result) => {
                if (result) {
                  toast.success(t("copySuccess", "Copy Success"));
                }
              }}
              text={`${location?.origin}/auth?invite=${user?.refer_code}`}
            >
              <Button className="shrink-0 gap-2" size="sm" variant="secondary">
                <Copy className="h-4 w-4" />
                {t("copyInviteLink", "Copy Invite Link")}
              </Button>
            </CopyToClipboard>
          </div>
        </Card.Content>
      </Card>
      <ProList<API.UserAffiliate, Record<string, unknown>>
        header={{
          title: t("inviteRecords", "Invite Records"),
        }}
        renderItem={(item) => (
          <Card className="overflow-hidden">
            <Card.Content className="p-3 text-sm">
              <ul className="grid grid-cols-2 gap-3 *:flex *:flex-col">
                <li className="font-semibold">
                  <span className="text-muted">
                    {t("userIdentifier", "User Identifier")}
                  </span>
                  <span>{item.identifier}</span>
                </li>
                <li className="font-semibold">
                  <span className="text-muted">
                    {t("registrationTime", "Registration Time")}
                  </span>
                  <time>{formatDate(item.registered_at)}</time>
                </li>
              </ul>
            </Card.Content>
          </Card>
        )}
        request={async (pagination, filter) => {
          const response = await queryUserAffiliateList({
            ...pagination,
            ...filter,
          });
          return {
            list: response.data.data?.list || [],
            total: response.data.data?.total || 0,
          };
        }}
      />
    </div>
  );
}
