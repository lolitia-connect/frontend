"use client";

import { Modal, toast } from "@heroui/react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { BlockLoading } from "@workspace/ui/composed/block-loading";
import { useQuery } from "@workspace/ui/hooks/query";
import { getSystemNodeConfig as getNodeConfig } from "@workspace/ui/services/admin/admin";
import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

type Props = {
  server: API.Server;
  trigger?: ReactNode;
};

export default function ServerInstall({ server, trigger }: Props) {
  const { t } = useTranslation("servers");
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");

  const { data: cfgResp, isLoading } = useQuery({
    queryKey: ["getNodeConfig"],
    queryFn: async () => {
      const { data } = await getNodeConfig();
      return data.data as API.NodeConfig | undefined;
    },
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      const host = localStorage.getItem("API_HOST") ?? window.location.origin;
      setDomain(host);
    }
  }, [open]);

  const installCommand = useMemo(() => {
    const secret = cfgResp?.node_secret ?? "";
    return `wget -N https://raw.githubusercontent.com/lolitia-connect/node-backend/master/scripts/install.sh && bash install.sh --api-host ${domain} --server-id ${server.id} --secret-key ${secret}`;
  }, [domain, server.id, cfgResp?.node_secret]);

  async function handleCopy() {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(installCommand);
      } else {
        // fallback for environments without clipboard API
        const el = document.createElement("textarea");
        el.value = installCommand;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      toast.success(t("copied", "Copied"));
      setOpen(false);
    } catch {
      toast.danger(t("copyFailed", "Copy failed"));
    }
  }

  const onDomainChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
    localStorage.setItem("API_HOST", e.target.value);
  }, []);
  return (
    <Modal isOpen={open} onOpenChange={setOpen}>
      {trigger || (
        <Button variant="secondary">{t("connect", "Connect")}</Button>
      )}

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-[720px] max-w-full md:max-w-3xl">
            <Modal.Header>
              <Modal.Heading>
                {t("oneClickInstall", "One-click Install")}
              </Modal.Heading>
            </Modal.Header>

            <div className="space-y-4">
              <div>
                <Label>{t("apiHost", "API Host")}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    onChange={onDomainChange}
                    placeholder={t(
                      "apiHostPlaceholder",
                      "http(s)://example.com"
                    )}
                    value={domain}
                  />
                </div>
              </div>

              <div>
                <Label>{t("installCommand", "Install command")}</Label>
                {isLoading ? (
                  <BlockLoading minHeight="5.5rem" surface={false} />
                ) : (
                  <textarea
                    aria-label={t("installCommand", "Install command")}
                    className="min-h-[88px] w-full rounded border p-2 font-mono text-sm"
                    readOnly
                    value={installCommand}
                  />
                )}
              </div>
            </div>

            <Modal.Footer className="flex-row justify-end gap-2 pt-3">
              <Button onClick={() => setOpen(false)} variant="outline">
                {t("close", "Close")}
              </Button>
              <Button disabled={isLoading || !cfgResp} onClick={handleCopy}>
                {t("copyAndClose", "Copy and Close")}
              </Button>
            </Modal.Footer>
            <Modal.CloseTrigger aria-label="Close" />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
