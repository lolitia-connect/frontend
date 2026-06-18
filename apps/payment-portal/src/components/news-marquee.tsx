import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useEffect, useMemo, useState } from "react";

interface NewsMarqueeProps {
  items: string[];
  title: string;
  subtitle: string;
  siteLogo?: string;
  siteName?: string;
}

interface NewsSlide {
  date: string;
  title: string;
  description: string;
}

function normalizeNewsItem(item: string, index: number): NewsSlide {
  const parts = item
    .split("@@")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    const [date = "", title = "", ...descriptionParts] = parts;
    return {
      date,
      title,
      description: descriptionParts.join(" "),
    };
  }

  const sentences = item
    .split(/(?<=[。.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const title = sentences[0] || item;
  const description =
    sentences.slice(1).join(" ") ||
    item ||
    "Existing backend authentication and payment capabilities remain unchanged.";

  return {
    date: `News ${String(index + 1).padStart(2, "0")}`,
    title,
    description,
  };
}

export function NewsMarquee({
  items,
  title,
  subtitle,
  siteLogo,
  siteName,
}: Readonly<NewsMarqueeProps>) {
  const slides = useMemo(
    () => (items.length > 0 ? items : [subtitle]).map(normalizeNewsItem),
    [items, subtitle]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide =
    slides[activeIndex] ?? slides[0] ?? normalizeNewsItem(subtitle, 0);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          {siteLogo ? (
            <img
              alt={siteName || title}
              className="h-12 w-auto object-contain"
              src={siteLogo}
            />
          ) : siteName ? (
            <span className="font-semibold text-2xl">{siteName}</span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <CardTitle className="text-3xl">{title}</CardTitle>

        <div className="space-y-3" key={`${activeSlide.date}-${activeIndex}`}>
          <p className="text-muted-foreground text-sm">{activeSlide.date}</p>
          <h3 className="font-semibold text-xl">{activeSlide.title}</h3>
          <p className="text-muted-foreground">{activeSlide.description}</p>
        </div>

        <div className="flex justify-center gap-2" role="tablist">
          {slides.map((slide, index) => (
            <button
              aria-label={slide.title}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === activeIndex
                  ? "bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              key={`${slide.date}-${index}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
