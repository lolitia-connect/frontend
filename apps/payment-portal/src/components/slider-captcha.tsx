import { Button, Modal, Spinner } from "@heroui/react";
import { LoadingBar } from "@workspace/ui/components/progress";
import {
  generateCaptcha,
  verifyCaptchaSlider,
} from "@workspace/ui/services/common/auth";
import { CheckCircle, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface SliderCaptchaProps {
  onChange: (value: string) => void;
  resetKey: number;
  value: string;
}

interface TrailPoint {
  t: number;
  x: number;
  y: number;
}

const BLOCK_SIZE = 100;
const BG_NATURAL_WIDTH = 560;
const BG_NATURAL_HEIGHT = 280;

export function SliderCaptcha({
  value,
  resetKey,
  onChange,
}: Readonly<SliderCaptchaProps>) {
  const { t } = useTranslation("app");
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startBlock = useRef({ x: 0, y: 50 });
  const dragStartTime = useRef(0);
  const trail = useRef<TrailPoint[]>([]);

  const [open, setOpen] = useState(false);
  const [captchaId, setCaptchaId] = useState("");
  const [bgImage, setBgImage] = useState("");
  const [blockImage, setBlockImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(Boolean(value));
  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "fail"
  >("idle");
  const [blockPos, setBlockPos] = useState({ x: 0, y: 50 });

  const getContainerSize = () => {
    const element = containerRef.current;
    if (!element) return { w: BG_NATURAL_WIDTH, h: BG_NATURAL_HEIGHT };
    return { w: element.clientWidth, h: element.clientHeight };
  };

  const fetchCaptcha = useCallback(async () => {
    setLoading(true);
    setStatus("idle");
    setBlockPos({ x: 0, y: 50 });
    trail.current = [];
    try {
      const response = await generateCaptcha();
      const data = response.data?.data;
      if (data) {
        setCaptchaId(String(data.id || ""));
        setBgImage(String(data.image || ""));
        setBlockImage(String(data.block_image || ""));
      }
    } catch {
      setCaptchaId("");
      setBgImage("");
      setBlockImage("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setVerified(Boolean(value));
  }, [value]);

  useEffect(() => {
    setVerified(false);
    setOpen(false);
    setStatus("idle");
    setBlockPos({ x: 0, y: 50 });
    trail.current = [];
  }, [resetKey]);

  const triggerFail = () => {
    setStatus("fail");
    window.setTimeout(() => {
      fetchCaptcha();
    }, 800);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (status !== "idle" || loading) return;
    dragging.current = true;
    dragStartTime.current = Date.now();
    trail.current = [];
    startPointer.current = { x: event.clientX, y: event.clientY };
    startBlock.current = { ...blockPos };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();

    trail.current.push({
      x: Math.round(startBlock.current.x),
      y: Math.round(startBlock.current.y),
      t: 0,
    });
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    const { w, h } = getContainerSize();
    const scaleX = BG_NATURAL_WIDTH / w;
    const scaleY = BG_NATURAL_HEIGHT / h;
    const dx = (event.clientX - startPointer.current.x) * scaleX;
    const dy = (event.clientY - startPointer.current.y) * scaleY;
    const newX = Math.max(
      0,
      Math.min(startBlock.current.x + dx, BG_NATURAL_WIDTH - BLOCK_SIZE)
    );
    const newY = Math.max(
      0,
      Math.min(startBlock.current.y + dy, BG_NATURAL_HEIGHT - BLOCK_SIZE)
    );
    setBlockPos({ x: newX, y: newY });

    trail.current.push({
      x: Math.round(newX),
      y: Math.round(newY),
      t: Date.now() - dragStartTime.current,
    });
  };

  const onPointerUp = async (event: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const { w, h } = getContainerSize();
    const scaleX = BG_NATURAL_WIDTH / w;
    const scaleY = BG_NATURAL_HEIGHT / h;
    const dx = (event.clientX - startPointer.current.x) * scaleX;
    const dy = (event.clientY - startPointer.current.y) * scaleY;
    const finalX = Math.round(
      Math.max(
        0,
        Math.min(startBlock.current.x + dx, BG_NATURAL_WIDTH - BLOCK_SIZE)
      )
    );
    const finalY = Math.round(
      Math.max(
        0,
        Math.min(startBlock.current.y + dy, BG_NATURAL_HEIGHT - BLOCK_SIZE)
      )
    );
    setBlockPos({ x: finalX, y: finalY });

    trail.current.push({
      x: finalX,
      y: finalY,
      t: Date.now() - dragStartTime.current,
    });

    setStatus("verifying");
    try {
      const response = await verifyCaptchaSlider({
        id: captchaId,
        x: finalX,
        y: finalY,
        trail: JSON.stringify(trail.current),
      });
      const token = response.data?.data?.token;
      if (token) {
        setStatus("success");
        window.setTimeout(() => {
          setVerified(true);
          onChange(token);
          setOpen(false);
        }, 500);
        return;
      }
      triggerFail();
    } catch {
      triggerFail();
    }
  };

  const blockLeftPct = (blockPos.x / BG_NATURAL_WIDTH) * 100;
  const blockTopPct = (blockPos.y / BG_NATURAL_HEIGHT) * 100;
  const blockSizeWPct = (BLOCK_SIZE / BG_NATURAL_WIDTH) * 100;
  const blockSizeHPct = (BLOCK_SIZE / BG_NATURAL_HEIGHT) * 100;

  return (
    <>
      <Button
        className="w-full"
        onPress={() => {
          if (verified) return;
          setOpen(true);
          fetchCaptcha();
        }}
        type="button"
        variant={verified ? "primary" : "outline"}
      >
        {verified ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("captcha.slider.verified", "验证已通过")}
          </>
        ) : (
          t("captcha.slider.action", "点击完成滑块验证")
        )}
      </Button>

      <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>
                {t("captcha.slider.title", "滑块验证")}
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className="space-y-3">
              <div
                className="relative aspect-2/1 w-full overflow-hidden rounded-field bg-default"
                ref={containerRef}
              >
                <div className="absolute inset-0">
                  {loading ? (
                    <div className="flex h-full items-center justify-center text-muted text-sm">
                      <Spinner
                        aria-label={t("captcha.loading", "加载中...")}
                        size="sm"
                      />
                    </div>
                  ) : bgImage ? (
                    <>
                      <Image
                        alt="captcha background"
                        className="absolute inset-0 h-full w-full"
                        draggable={false}
                        height={280}
                        src={bgImage}
                        unoptimized
                        width={560}
                      />
                      {blockImage ? (
                        <Image
                          alt="captcha block"
                          className="absolute cursor-grab active:cursor-grabbing"
                          draggable={false}
                          height={100}
                          onPointerDown={onPointerDown}
                          onPointerMove={onPointerMove}
                          onPointerUp={onPointerUp}
                          src={blockImage}
                          style={{
                            left: `${blockLeftPct}%`,
                            top: `${blockTopPct}%`,
                            width: `${blockSizeWPct}%`,
                            height: `${blockSizeHPct}%`,
                            touchAction: "none",
                          }}
                          unoptimized
                          width={100}
                        />
                      ) : null}
                      {status === "verifying" && (
                        <LoadingBar className="absolute inset-x-0 top-0" />
                      )}
                      {(status === "success" || status === "fail") && (
                        <div
                          className={`absolute inset-0 flex items-center justify-center font-medium text-sm ${
                            status === "success"
                              ? "bg-success-soft text-success-soft-foreground"
                              : "bg-danger-soft text-danger-soft-foreground"
                          }`}
                        >
                          {status === "success"
                            ? t("captcha.slider.verified", "验证已通过")
                            : t("captcha.slider.retry", "请重试")}
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>

              <p className="text-center text-muted text-xs">
                {t("captcha.slider.hint", "拖动拼图块完成验证")}
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                className="w-full"
                isDisabled={loading || status !== "idle"}
                onPress={fetchCaptcha}
                type="button"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("captcha.slider.refresh", "刷新验证")}
              </Button>
            </Modal.Footer>
            <Modal.CloseTrigger aria-label={t("components:close", "Close")} />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
