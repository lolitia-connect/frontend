import { Button, Description, Modal, Table } from "@heroui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type SnapshotDetail = Partial<API.GroupHistoryDetailItem> & {
  NodeGroupId?: string | number;
  UserCount?: number;
  NodeCount?: number;
  UserData?: string;
};

type SnapshotUser = { id: string | number; email?: string };

export function GroupDetailStats({ details }: { details: SnapshotDetail[] }) {
  const { t } = useTranslation("group");
  const stats = [
    [
      t("totalUsers", "Total Users"),
      details.reduce(
        (sum, row) => sum + (row.UserCount ?? row.user_count ?? 0),
        0
      ),
    ],
    [
      t("totalNodes", "Total Nodes"),
      details.reduce(
        (sum, row) => sum + (row.NodeCount ?? row.node_count ?? 0),
        0
      ),
    ],
    [t("totalNodeGroups", "Total Node Groups"), details.length],
  ] as const;
  return (
    <dl className="grid grid-cols-3 gap-2">
      {stats.map(([label, count]) => (
        <div
          className="flex min-w-0 flex-col-reverse rounded-xl bg-default/50 p-3 text-center"
          key={label}
        >
          <dt className="text-muted text-xs">{label}</dt>
          <dd className="font-semibold text-xl tabular-nums">{count}</dd>
        </div>
      ))}
    </dl>
  );
}

export function GroupDetailTable({
  details,
  nodeGroups,
}: {
  details: SnapshotDetail[];
  nodeGroups?: API.NodeGroup[];
}) {
  const { t } = useTranslation("group");
  const [selection, setSelection] = useState<{
    name: string;
    users: SnapshotUser[];
  } | null>(null);
  const groupNames = new Map(
    nodeGroups?.map(({ id, name }) => [String(id), name])
  );

  function showUsers(name: string, detail: SnapshotDetail) {
    let users: SnapshotUser[] = [];
    const raw = detail.UserData || detail.user_data;
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) users = parsed;
      } catch (error) {
        console.error("Failed to parse group user data:", error);
      }
    }
    setSelection({ name, users });
  }

  return (
    <>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label={t("groupDetails", "Group Details")}>
            <Table.Header>
              <Table.Column id="group" isRowHeader>
                {t("nodeGroup", "Node Group")}
              </Table.Column>
              <Table.Column className="text-end" id="users">
                {t("userCount", "User Count")}
              </Table.Column>
              <Table.Column className="text-end" id="nodes">
                {t("nodeCount", "Node Count")}
              </Table.Column>
            </Table.Header>
            <Table.Body>
              {details.map((detail, index) => {
                const groupId = detail.NodeGroupId ?? detail.node_group_id;
                const name =
                  groupNames.get(String(groupId)) ||
                  `${t("idPrefix", "#")}${groupId}`;
                const count = detail.UserCount ?? detail.user_count ?? 0;
                const rowId = detail.id ?? `${groupId}-${index}`;
                return (
                  <Table.Row id={rowId} key={rowId}>
                    <Table.Cell>
                      <div className="font-medium">{name}</div>
                      <div className="text-muted text-xs">
                        {t("id", "ID")}: {groupId}
                      </div>
                    </Table.Cell>
                    <Table.Cell className="text-end">
                      <Button
                        aria-label={`${name} · ${t("userList", "User List")} (${count})`}
                        className="tabular-nums"
                        isDisabled={count === 0}
                        onPress={() => showUsers(name, detail)}
                        size="sm"
                        variant="ghost"
                      >
                        {count}
                      </Button>
                    </Table.Cell>
                    <Table.Cell className="text-end tabular-nums">
                      {detail.NodeCount ?? detail.node_count ?? 0}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <Modal.Backdrop
        isOpen={selection !== null}
        onOpenChange={(open) => {
          if (!open) setSelection(null);
        }}
      >
        <Modal.Container>
          <Modal.Dialog className="max-h-[80dvh] sm:max-w-2xl">
            <Modal.Header>
              <Modal.Heading>
                {selection?.name} · {t("userList", "User List")}
              </Modal.Heading>
              <Description>
                {t("totalUsers", "Total Users")}: {selection?.users.length ?? 0}
              </Description>
            </Modal.Header>
            <Modal.Body>
              {selection?.users.length ? (
                <Table>
                  <Table.ScrollContainer>
                    <Table.Content aria-label={t("userList", "User List")}>
                      <Table.Header>
                        <Table.Column id="id" isRowHeader>
                          {t("id", "ID")}
                        </Table.Column>
                        <Table.Column id="email">
                          {t("email", "Email")}
                        </Table.Column>
                      </Table.Header>
                      <Table.Body>
                        {selection.users.map((user) => (
                          <Table.Row id={user.id} key={user.id}>
                            <Table.Cell>{user.id}</Table.Cell>
                            <Table.Cell>{user.email || "-"}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
              ) : (
                <p className="py-6 text-center text-muted text-sm">
                  {t("noUsers", "No users found")}
                </p>
              )}
            </Modal.Body>
            <Modal.CloseTrigger />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
