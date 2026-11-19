"use client";

import {
  Description,
  ListBox,
  Modal,
  Select,
  SelectPopover as SelectContent,
  SelectIndicator,
  ListBoxItem as SelectItem,
  SelectTrigger,
  SelectValue,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  bindNodeGroups,
  getNodeGroupList,
} from "@workspace/ui/services/admin/group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface BindNodeGroupsDialogProps {
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  userGroupIds: number[];
  userGroupNames: string[];
}

export default function BindNodeGroupsDialog({
  userGroupIds,
  userGroupNames,
  onOpenChange,
  onSuccess,
}: BindNodeGroupsDialogProps) {
  const { t } = useTranslation("group");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedNodeGroupId, setSelectedNodeGroupId] = useState<
    number | undefined
  >();

  const { data: nodeGroupsData, isLoading } = useQuery({
    queryKey: ["nodeGroups"],
    queryFn: async () => {
      const { data } = await getNodeGroupList({ page: 1, size: 1000 });
      return data.data?.list || [];
    },
  });

  useEffect(() => {
    if (open && nodeGroupsData) {
      // Load current binding when dialog opens
      loadCurrentBinding();
    }
  }, [open]);

  const loadCurrentBinding = () => {
    // Get first user group's current node group binding
    // For batch binding, we'll default to unbound
    setSelectedNodeGroupId(undefined);
  };

  const handleBind = async () => {
    if (selectedNodeGroupId === undefined) {
      toast.error(t("selectNodeGroupRequired", "Please select a node group"));
      return;
    }

    setSaving(true);
    try {
      await bindNodeGroups({
        user_group_ids: userGroupIds,
        node_group_id: selectedNodeGroupId === 0 ? null : selectedNodeGroupId,
      } as API.BindNodeGroupsRequest);

      toast.success(
        t(
          "bindSuccess",
          "Successfully bound {{userGroupCount}} user groups to node group"
        ).replace(/{{userGroupCount}}/g, String(userGroupIds.length))
      );

      setOpen(false);
      onOpenChange?.(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to bind node group:", error);
      toast.error(t("bindFailed", "Failed to bind node group"));
    } finally {
      setSaving(false);
    }
  };

  const displayNames =
    userGroupNames.length > 2
      ? `${userGroupNames.slice(0, 2).join(", ")}... (${userGroupIds.length})`
      : userGroupNames.join(", ");

  return (
    <Modal
      isOpen={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        onOpenChange?.(newOpen);
      }}
    >
      <Button size="sm" variant="outline">
        {t("bindNodeGroup", "Bind Node Group")}
      </Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-md">
            <Modal.Header>
              <Modal.Heading>
                {t("bindNodeGroup", "Bind Node Group")}
              </Modal.Heading>
              <Description slot="description">
                {t(
                  "bindNodeGroupDescription",
                  "Select a node group to bind to user groups: {{userGroups}}",
                  { userGroups: displayNames }
                ).replace(/{{userGroups}}/g, displayNames)}
              </Description>
            </Modal.Header>

            <div className="space-y-4 py-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner className="size-6" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="node-group">
                    {t("selectNodeGroup", "Select Node Group")}
                  </Label>
                  <Select
                    aria-label={t(
                      "selectNodeGroupPlaceholder",
                      "Select a node group..."
                    )}
                    onSelectionChange={(key) => {
                      if (key != null)
                        ((val) =>
                          setSelectedNodeGroupId(
                            Number.parseInt(val, 10) || undefined
                          ))(String(key));
                    }}
                    placeholder={t(
                      "selectNodeGroupPlaceholder",
                      "Select a node group..."
                    )}
                    selectedKey={
                      (selectedNodeGroupId?.toString() || "") == null
                        ? undefined
                        : String(selectedNodeGroupId?.toString() || "")
                    }
                  >
                    <SelectTrigger className="w-full" id="node-group">
                      <SelectValue />
                      <SelectIndicator />
                    </SelectTrigger>
                    <SelectContent>
                      <ListBox>
                        <SelectItem id="0">
                          {t("unbound", "Unbound")}
                        </SelectItem>
                        {nodeGroupsData?.map((nodeGroup) => (
                          <SelectItem
                            id={String(nodeGroup.id)}
                            key={nodeGroup.id}
                          >
                            {nodeGroup.name}
                          </SelectItem>
                        ))}
                      </ListBox>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Modal.Footer>
              <Button
                loading={saving}
                onClick={() => {
                  setOpen(false);
                  onOpenChange?.(false);
                }}
                variant="outline"
              >
                {t("cancel", "Cancel")}
              </Button>
              <Button
                disabled={selectedNodeGroupId === undefined}
                loading={saving}
                onClick={handleBind}
              >
                {t("confirm", "Confirm")}
              </Button>
            </Modal.Footer>
            <Modal.CloseTrigger aria-label="Close" />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
