"use client";

import { Modal, Table } from "@heroui/react";
import { BlockLoading } from "@workspace/ui/composed/block-loading";
import { useQuery } from "@workspace/ui/hooks/query";
import { getRedemptionRecordList } from "@workspace/ui/services/admin/redemption";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/common";

interface RedemptionRecordsProps {
  codeId: string | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export default function RedemptionRecords({
  codeId,
  open,
  onOpenChange,
}: RedemptionRecordsProps) {
  const { t } = useTranslation("redemption");
  const [pagination, setPagination] = useState({ page: 1, size: 10 });
  const { data, isLoading } = useQuery({
    queryKey: ["redemptionRecords", codeId, pagination.page, pagination.size],
    enabled: open && Boolean(codeId),
    queryFn: async () => {
      const response = await getRedemptionRecordList({
        ...pagination,
        code_id: codeId!,
      });
      return response.data.data;
    },
  });
  const records = data?.list ?? [];
  const total = data?.total ?? 0;

  return (
    <Modal.Backdrop isOpen={open} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <Modal.Header>
            <Modal.Heading>{t("records", "Redemption Records")}</Modal.Heading>
          </Modal.Header>
          <div className="mt-4">
            {isLoading ? (
              <BlockLoading minHeight="6rem" surface={false} />
            ) : records.length === 0 ? (
              <div className="py-8 text-center text-muted">
                {t("noRecords", "No records found")}
              </div>
            ) : (
              <>
                <Table>
                  <Table.ScrollContainer>
                    <Table.Content
                      aria-label={t("records", "Redemption Records")}
                    >
                      <Table.Header>
                        <Table.Column id="column-0" isRowHeader>
                          {t("id", "ID")}
                        </Table.Column>
                        <Table.Column id="column-1">
                          {t("userId", "User ID")}
                        </Table.Column>
                        <Table.Column id="column-2">
                          {t("subscribeId", "Subscribe ID")}
                        </Table.Column>
                        <Table.Column id="column-3">
                          {t("unitTime", "Unit Time")}
                        </Table.Column>
                        <Table.Column id="column-4">
                          {t("quantity", "Quantity")}
                        </Table.Column>
                        <Table.Column id="column-5">
                          {t("redeemedAt", "Redeemed At")}
                        </Table.Column>
                      </Table.Header>
                      <Table.Body>
                        {records.map((record) => {
                          const unitTimeMap: Record<string, string> = {
                            Day: t("form.day", "Day"),
                            Month: t("form.month", "Month"),
                            Quarter: t("form.quarter", "Quarter"),
                            HalfYear: t("form.halfYear", "Half Year"),
                            Year: t("form.year", "Year"),
                          };
                          return (
                            <Table.Row id={record.id} key={record.id}>
                              <Table.Cell>{record.id}</Table.Cell>
                              <Table.Cell>{record.user_id}</Table.Cell>
                              <Table.Cell>{record.subscribe_id}</Table.Cell>
                              <Table.Cell>
                                {unitTimeMap[record.unit_time] ||
                                  record.unit_time}
                              </Table.Cell>
                              <Table.Cell>{record.quantity}</Table.Cell>
                              <Table.Cell>
                                {record.redeemed_at
                                  ? formatDate(record.redeemed_at)
                                  : "--"}
                              </Table.Cell>
                            </Table.Row>
                          );
                        })}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
                {total > pagination.size && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-muted text-sm">
                      {t("total", "Total")}: {total}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="rounded border px-3 py-1 text-sm hover:bg-default disabled:opacity-50"
                        disabled={pagination.page === 1}
                        onClick={() =>
                          setPagination((p) => ({ ...p, page: p.page - 1 }))
                        }
                        type="button"
                      >
                        {t("previous", "Previous")}
                      </button>
                      <button
                        className="rounded border px-3 py-1 text-sm hover:bg-default disabled:opacity-50"
                        disabled={pagination.page * pagination.size >= total}
                        onClick={() =>
                          setPagination((p) => ({ ...p, page: p.page + 1 }))
                        }
                        type="button"
                      >
                        {t("next", "Next")}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <Modal.CloseTrigger aria-label="Close" />
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
