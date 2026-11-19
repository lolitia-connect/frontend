"use client";

import { Modal } from "@heroui/react";
import { Button } from "@workspace/ui/components/button";

import { Spinner } from "@workspace/ui/components/spinner";
import { Icon } from "@workspace/ui/composed/icon";
import {
  generateCaptcha,
  verifyCaptchaSlider,
} from "@workspace/ui/services/common/auth";
import {
  type RefObject,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

export interface SliderCaptchaRef {
  reset: () => void;
}

interface SliderCaptchaProps {
  onChange?: (value: string) => void;
  value?: string;
}

interface TrailPoint {
  t: number;
  x: number;
  y: number;
}

const BLOCK_SIZE = 100;
const BG_NATURAL_WIDTH = 560;
const BG_NATURAL_HEIGHT = 280;

const SliderCaptcha = ({
  onChange,
  ref,
}: SliderCaptchaProps & { ref?: RefObject<SliderCaptchaRef | null> }) => {
  const { t } = useTranslation("auth");
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [captchaId, setCaptchaId] = useState("");
  const [bgImage, setBgImage] = useState("");
  const [blockImage, setBlockImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "fail">("idle");
  const [blockPos, setBlockPos] = useState({ x: 0, y: 50 });
  const [shaking, setShaking] = useState(false);

  const dragging = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startBlock = useRef({ x: 0, y: 50 });
  const dragStartTime = useRef(0);
  const trail = useRef<TrailPoint[]>([]);

  const getContainerSize = () => {
    const el = containerRef.current;
    if (!el) return { w: BG_NATURAL_WIDTH, h: BG_NATURAL_HEIGHT };
    return { w: el.clientWidth, h: el.clientHeight };
  };

  const fetchCaptcha = useCallback(async () => {
    setLoading(true);
    setStatus("idle");
    setBlockPos({ x: 0, y: 50 });
    trail.current = [];
    try {
      const res = await generateCaptcha();
      const data = res.data?.data;
      if (data) {
        setCaptchaId(data.id);
        setBgImage(data.image);
        setBlockImage(data.block_image ?? "");
      }
    } catch (e) {
      console.error("Failed to generate slider captcha:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = () => {
    if (verified) return;
    setOpen(true);
    fetchCaptcha();
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      setVerified(false);
      onChange?.("");
      setOpen(false);
      trail.current = [];
    },
  }));

  const onPointerDown = (e: React.PointerEvent) => {
    if (status === "success" || loading) return;
    dragging.current = true;
    dragStartTime.current = Date.now();
    trail.current = [];
    startPointer.current = { x: e.clientX, y: e.clientY };
    startBlock.current = { ...blockPos };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();

    trail.current.push({
      x: Math.round(startBlock.current.x),
      y: Math.round(startBlock.current.y),
      t: 0,
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const { w, h } = getContainerSize();
    const scaleX = BG_NATURAL_WIDTH / w;
    const scaleY = BG_NATURAL_HEIGHT / h;
    const dx = (e.clientX - startPointer.current.x) * scaleX;
    const dy = (e.clientY - startPointer.current.y) * scaleY;
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

  const onPointerUp = async (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const { w, h } = getContainerSize();
    const scaleX = BG_NATURAL_WIDTH / w;
    const scaleY = BG_NATURAL_HEIGHT / h;
    const dx = (e.clientX - startPointer.current.x) * scaleX;
    const dy = (e.clientY - startPointer.current.y) * scaleY;
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

    try {
      const res = await verifyCaptchaSlider({
        id: captchaId,
        x: finalX,
        y: finalY,
        trail: JSON.stringify(trail.current),
      });
      const token = res.data?.data?.token;
      if (token) {
        setStatus("success");
        setTimeout(() => {
          setVerified(true);
          onChange?.(token);
          setOpen(false);
        }, 600);
      } else {
        triggerFail();
      }
    } catch {
      triggerFail();
    }
  };

  const triggerFail = () => {
    setStatus("fail");
    setShaking(true);
    setTimeout(() => {
      setShaking(false);
      fetchCaptcha();
    }, 800);
  };

  const blockLeftPct = (blockPos.x / BG_NATURAL_WIDTH) * 100;
  const blockTopPct = (blockPos.y / BG_NATURAL_HEIGHT) * 100;
  const blockSizeWPct = (BLOCK_SIZE / BG_NATURAL_WIDTH) * 100;
  const blockSizeHPct = (BLOCK_SIZE / BG_NATURAL_HEIGHT) * 100;

  return (
    <>
      {/* Trigger button */}
      <button
        className={`relative flex w-full items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors ${
          verified
            ? "border-success/40 bg-success-soft text-success-soft-foreground"
            : "border-field-border bg-background hover:bg-default"
        }`}
        onClick={handleOpen}
        type="button"
      >
        <span
          className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
            verified ? "bg-success" : "bg-accent"
          }`}
        >
          {verified ? (
            <Icon
              className="text-success-foreground text-xs"
              icon="mdi:check"
            />
          ) : (
            <>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
            </>
          )}
        </span>
        <span className={verified ? "font-medium" : "text-muted"}>
          {verified
            ? t("captcha.slider.success", "Verified")
            : t("captcha.slider.clickToVerify", "Click to verify")}
        </span>
        {verified && (
          <Icon className="ml-auto text-success" icon="mdi:check-circle" />
        )}
      </button>

      {/* Slider dialog */}

      <Modal.Backdrop
        isOpen={open}
        onOpenChange={(o) => {
          if (!o) setOpen(false);
        }}
      >
        <Modal.Container>
          <Modal.Dialog className="select-none p-6 sm:max-w-md">
            <Modal.Header>
              <Modal.Heading>
                {t("captcha.slider.title", "Security Verification")}
              </Modal.Heading>
            </Modal.Header>

            <div
              className={`relative w-full overflow-hidden rounded-md bg-default ${
                shaking ? "animate-[shake_0.4s_ease-in-out]" : ""
              }`}
              ref={containerRef}
              style={{
                paddingTop: `${(BG_NATURAL_HEIGHT / BG_NATURAL_WIDTH) * 100}%`,
              }}
            >
              <div className="absolute inset-0">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <Spinner className="size-8 text-muted" />
                  </div>
                ) : bgImage ? (
                  <>
                    {/* biome-ignore lint/performance/noImgElement: backend-generated captcha image; next/image optimization not applicable */}
                    <img
                      alt="captcha background"
                      className="absolute inset-0 h-full w-full"
                      draggable={false}
                      src={bgImage}
                    />
                    {blockImage && (
                      // biome-ignore lint/performance/noImgElement: backend-generated captcha image; next/image optimization not applicable
                      <img
                        alt="captcha block"
                        className="absolute cursor-grab active:cursor-grabbing"
                        draggable={false}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        src={blockImage}
                        style={{
                          filter:
                            status === "success"
                              ? "drop-shadow(0 0 3px var(--success))"
                              : status === "fail"
                                ? "drop-shadow(0 0 3px var(--danger))"
                                : "drop-shadow(0 0 2px color-mix(in oklab, var(--foreground) 45%, transparent))",
                          left: `${blockLeftPct}%`,
                          top: `${blockTopPct}%`,
                          width: `${blockSizeWPct}%`,
                          height: `${blockSizeHPct}%`,
                          touchAction: "none",
                        }}
                      />
                    )}
                    {status !== "idle" && (
                      <div
                        className={`absolute inset-0 flex items-center justify-center font-medium text-sm ${
                          status === "success"
                            ? "bg-success/20 text-success-soft-foreground"
                            : "bg-danger/20 text-danger-soft-foreground"
                        }`}
                      >
                        {status === "success"
                          ? t("captcha.slider.success", "Verified")
                          : t("captcha.slider.fail", "Try again")}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            <p className="text-center text-muted text-xs">
              {t("captcha.slider.hint", "Drag the piece to fit the puzzle")}
            </p>

            <Button
              className="w-full"
              disabled={loading}
              onClick={fetchCaptcha}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Icon icon="mdi:refresh" />
              {t("captcha.clickToRefresh", "Refresh")}
            </Button>
            <Modal.CloseTrigger aria-label="Close" />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>
    </>
  );
};

SliderCaptcha.displayName = "SliderCaptcha";

export default SliderCaptcha;
