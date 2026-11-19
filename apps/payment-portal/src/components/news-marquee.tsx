import { Button, Card } from "@heroui/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface NewsMarqueeProps {
  items: string[];
  siteLogo?: string;
  siteName?: string;
  subtitle: string;
  title: string;
}

interface NewsSlide {
  date: string;
  description: string;
  title: string;
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
      <Card.Header>
        <div className="flex items-center gap-3">
          {siteLogo ? (
            <Image
              alt={siteName || title}
              className="h-12 w-auto object-contain"
              height={48}
              src={siteLogo}
              unoptimized
              width={120}
            />
          ) : siteName ? (
            <span className="font-semibold text-2xl text-foreground">
              {siteName}
            </span>
          ) : null}
        </div>
      </Card.Header>
      <Card.Content className="space-y-6">
        <Card.Title className="text-3xl">{title}</Card.Title>

        <div className="space-y-3" key={`${activeSlide.date}-${activeIndex}`}>
          <p className="text-muted text-sm">{activeSlide.date}</p>
          <h3 className="font-semibold text-foreground text-xl">
            {activeSlide.title}
          </h3>
          <p className="text-muted">{activeSlide.description}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {slides.map((slide, index) => (
            <Button
              aria-label={slide.title}
              aria-pressed={index === activeIndex}
              isIconOnly
              key={`${slide.date}-${index}`}
              onPress={() => setActiveIndex(index)}
              size="sm"
              variant={index === activeIndex ? "primary" : "tertiary"}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}
