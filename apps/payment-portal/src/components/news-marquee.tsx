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
    <div className="portal-news-panel w-full max-w-2xl">
      <div className="portal-news-brand">
        {siteLogo ? (
          <img
            alt={siteName || title}
            className="portal-news-brand-logo"
            src={siteLogo}
          />
        ) : siteName ? (
          <span className="portal-news-brand-text">{siteName}</span>
        ) : (
          <div className="portal-news-brand-mark" />
        )}
      </div>

      <div className="portal-news-stage">
        <div className="space-y-4">
          <h1 className="portal-news-heading">{title}</h1>
          <div
            className="portal-news-slide"
            key={`${activeSlide.date}-${activeIndex}`}
          >
            <p className="portal-news-date">{activeSlide.date}</p>
            <h2 className="portal-news-slide-title">{activeSlide.title}</h2>
            <p className="portal-news-slide-description">
              {activeSlide.description}
            </p>
          </div>
        </div>

        <div className="portal-news-dots" role="tablist">
          {slides.map((slide, index) => (
            <button
              aria-label={slide.title}
              className={`portal-news-dot ${
                index === activeIndex ? "is-active" : ""
              }`}
              key={`${slide.date}-${index}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
