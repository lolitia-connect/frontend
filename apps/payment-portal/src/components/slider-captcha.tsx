import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  generateCaptcha,
  verifyCaptchaSlider,
} from "@workspace/ui/services/common/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface SliderCaptchaProps {
  value: string;
  resetKey: number;
  onChange: (value: string) => void;
}

interface TrailPoint {
  x: number;
  y: number;
  t: number;
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
  const [status, setStatus] = useState<"idle" | "success" | "fail">("idle");
  const [blockPos, setBlockPos] = useState({ x: 0, y: 50 });
  const [shaking, setShaking] = useState(false);

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
    } catch (_error) {
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
    setShaking(true);
    window.setTimeout(() => {
      setShaking(false);
      void fetchCaptcha();
    }, 800);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (status === "success" || loading) return;
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
    } catch (_error) {
      triggerFail();
    }
  };

  const blockLeftPct = (blockPos.x / BG_NATURAL_WIDTH) * 100;
  const blockTopPct = (blockPos.y / BG_NATURAL_HEIGHT) * 100;
  const blockSizeWPct = (BLOCK_SIZE / BG_NATURAL_WIDTH) * 100;
  const blockSizeHPct = (BLOCK_SIZE / BG_NATURAL_HEIGHT) * 100;

  return (
    <>
      <button
        className={`portal-captcha-trigger ${verified ? "is-verified" : ""}`}
        onClick={() => {
          if (verified) return;
          setOpen(true);
          void fetchCaptcha();
        }}
        type="button"
      >
        <span className="portal-captcha-indicator" />
        <span>
          {verified
            ? t("captcha.slider.verified", "验证已通过")
            : t("captcha.slider.action", "点击完成滑块验证")}
        </span>
      </button>

      <Dialog
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
        }}
        open={open}
      >
        <DialogContent className="p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("captcha.slider.title", "滑块验证")}</DialogTitle>
          </DialogHeader>

          <div
            className={`relative w-full overflow-hidden rounded-md bg-muted ${
              shaking ? "animate-[shake_0.4s_ease-in-out]" : ""
            }`}
            ref={containerRef}
            style={{
              paddingTop: `${(BG_NATURAL_HEIGHT / BG_NATURAL_WIDTH) * 100}%`,
            }}
          >
            <div className="absolute inset-0">
              {loading ? (
                <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                  {t("captcha.loading", "加载中...")}
                </div>
              ) : bgImage ? (
                <>
                  <img
                    alt="captcha background"
                    className="absolute inset-0 h-full w-full"
                    draggable={false}
                    src={bgImage}
                  />
                  {blockImage ? (
                    <img
                      alt="captcha block"
                      className="absolute cursor-grab active:cursor-grabbing"
                      draggable={false}
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
                    />
                  ) : null}
                  {status !== "idle" ? (
                    <div
                      className={`absolute inset-0 flex items-center justify-center font-medium text-sm ${
                        status === "success"
                          ? "bg-green-500/20 text-green-700"
                          : "bg-red-500/20 text-red-700"
                      }`}
                    >
                      {status === "success"
                        ? t("captcha.slider.verified", "验证已通过")
                        : t("captcha.slider.retry", "请重试")}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>

          <p className="text-center text-muted-foreground text-xs">
            {t("captcha.slider.hint", "拖动拼图块完成验证")}
          </p>

          <button
            className="portal-secondary-btn w-full"
            disabled={loading}
            onClick={() => {
              void fetchCaptcha();
            }}
            type="button"
          >
            {t("captcha.slider.refresh", "刷新验证")}
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
