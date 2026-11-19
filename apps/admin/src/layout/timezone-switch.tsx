"use client";

import { Popover } from "@heroui/react";
import { buttonVariants } from "@workspace/ui/components/button";
import { Icon } from "@workspace/ui/composed/icon";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface TimezoneOption {
  label: string;
  timezone: string;
  value: string;
}

function getCurrentTime(timezone: string): string {
  try {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--:--";
  }
}

function getAllTimezones(locale = "en-US"): TimezoneOption[] {
  try {
    const timeZones = Intl.supportedValuesOf("timeZone");

    const processed = timeZones
      .map((tz) => {
        try {
          return {
            value: tz,
            label: tz,
            timezone: getTimezoneOffset(tz),
          };
        } catch {
          return {
            value: tz,
            label: tz,
            timezone: "UTC+00:00",
          };
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label, locale));

    const hasUTC = processed.some((tz) => tz.value === "UTC");
    if (!hasUTC) {
      processed.unshift({
        value: "UTC",
        label: "UTC",
        timezone: "UTC+00:00",
      });
    }

    return processed;
  } catch {
    return [
      {
        value: "UTC",
        label: "UTC",
        timezone: "UTC+00:00",
      },
    ];
  }
}

function getServerTimezones(): string[] {
  return ["UTC"];
}

function getRecommendedTimezones(): string[] {
  try {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (browserTimezone.startsWith("Asia/")) {
      return [
        "Asia/Shanghai",
        "Asia/Tokyo",
        "Asia/Kolkata",
        "Asia/Singapore",
        "Asia/Seoul",
      ];
    }
    if (browserTimezone.startsWith("Europe/")) {
      return [
        "Europe/London",
        "Europe/Paris",
        "Europe/Berlin",
        "Europe/Rome",
        "Europe/Madrid",
      ];
    }
    if (browserTimezone.startsWith("America/")) {
      return [
        "America/New_York",
        "America/Los_Angeles",
        "America/Chicago",
        "America/Denver",
        "America/Toronto",
      ];
    }
    if (browserTimezone.startsWith("Australia/")) {
      return [
        "Australia/Sydney",
        "Australia/Melbourne",
        "Australia/Perth",
        "Australia/Brisbane",
      ];
    }
    return [
      "America/New_York",
      "Europe/London",
      "Asia/Shanghai",
      "Asia/Tokyo",
      "Australia/Sydney",
    ];
  } catch {
    return [
      "America/New_York",
      "Europe/London",
      "Asia/Shanghai",
      "Asia/Tokyo",
      "Australia/Sydney",
    ];
  }
}

export function getTimezoneOffset(timezone: string, date = new Date()): string {
  try {
    const offsetName = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "longOffset",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value;

    if (!offsetName || offsetName === "GMT" || offsetName === "UTC") {
      return "UTC+00:00";
    }

    const match = /^(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(offsetName);
    if (!match) return "UTC+00:00";

    const [, sign, hour = "0", minute = "0"] = match;
    const hours = Number(hour);
    const minutes = Number(minute);
    if (hours > 23 || minutes > 59) return "UTC+00:00";
    if (hours === 0 && minutes === 0) return "UTC+00:00";

    return `UTC${sign}${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  } catch {
    return "UTC+00:00";
  }
}

interface TimezoneRowProps {
  active?: boolean;
  onSelect: (value: string) => void;
  option: TimezoneOption;
}

function TimezoneRow({ active, onSelect, option }: TimezoneRowProps) {
  return (
    <button
      className={`flex w-full cursor-pointer select-none items-center gap-3 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden hover:bg-default ${active ? "bg-accent/10" : ""}`}
      onClick={() => onSelect(option.value)}
      type="button"
    >
      <div className="flex flex-1 flex-col">
        <span className="font-medium">{option.value}</span>
        <span className="text-muted text-xs">
          {option.timezone} • {getCurrentTime(option.value)}
        </span>
      </div>
      <Icon
        className={active ? "h-4 w-4 opacity-100" : "h-4 w-4 opacity-0"}
        icon="uil:check"
      />
    </button>
  );
}

interface TimezoneGroupProps {
  heading: string;
  onSelect: (value: string) => void;
  options: TimezoneOption[];
  selected: string;
}

function TimezoneGroup({
  heading,
  onSelect,
  options,
  selected,
}: TimezoneGroupProps) {
  if (options.length === 0) return null;
  return (
    <div className="overflow-hidden p-1">
      <div className="px-2 py-1.5 font-medium text-muted text-xs">
        {heading}
      </div>
      {options.map((option) => (
        <TimezoneRow
          active={option.value === selected}
          key={`${heading}-${option.value}`}
          onSelect={onSelect}
          option={option}
        />
      ))}
    </div>
  );
}

export default function TimezoneSwitch() {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const [timezone, setTimezone] = useState<string>("UTC");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const timezoneOptions = useMemo(() => getAllTimezones(locale), [locale]);

  useEffect(() => {
    const savedTimezone = localStorage.getItem("timezone");
    if (savedTimezone) {
      setTimezone(savedTimezone);
    } else {
      try {
        const browserTimezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimezone(browserTimezone);
        localStorage.setItem("timezone", browserTimezone);
      } catch {
        setTimezone("UTC");
      }
    }
  }, []);

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
    localStorage.setItem("timezone", newTimezone);
    setSearch("");
    setOpen(false);

    window.dispatchEvent(
      new CustomEvent("timezoneChanged", {
        detail: { timezone: newTimezone },
      })
    );
  };

  const matchesSearch = (option: TimezoneOption) => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return true;
    return `${option.label} ${option.value}`
      .toLocaleLowerCase()
      .includes(query);
  };

  const recommended = getRecommendedTimezones();
  const servers = getServerTimezones();

  const currentGroup = timezoneOptions.filter(
    (option) => option.value === timezone && matchesSearch(option)
  );
  const serverGroup = timezoneOptions.filter(
    (option) =>
      servers.includes(option.value) &&
      option.value !== timezone &&
      matchesSearch(option)
  );
  const recommendedGroup = timezoneOptions.filter(
    (option) =>
      recommended.includes(option.value) &&
      option.value !== timezone &&
      matchesSearch(option)
  );
  const allGroup = timezoneOptions.filter(
    (option) =>
      !(servers.includes(option.value) || recommended.includes(option.value)) &&
      option.value !== timezone &&
      matchesSearch(option)
  );

  const isEmpty =
    currentGroup.length === 0 &&
    serverGroup.length === 0 &&
    recommendedGroup.length === 0 &&
    allGroup.length === 0;

  return (
    <Popover
      isOpen={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <Popover.Trigger
        aria-label="Timezone"
        className={`${buttonVariants({ className: "inline-flex items-center justify-center", size: "icon", variant: "ghost" })}`}
      >
        <Icon className="size-6" icon="uil:clock" />
      </Popover.Trigger>
      <Popover.Content
        className="w-80 max-w-[calc(100vw-2rem)] p-0"
        placement="bottom end"
      >
        <Popover.Dialog aria-label="Timezone" className="outline-hidden">
          <div className="flex flex-col">
            <div className="flex h-9 items-center gap-2 border-b px-3">
              <Icon className="size-4 shrink-0 opacity-50" icon="uil:search" />
              <input
                className="flex h-10 w-full bg-transparent py-3 text-sm outline-hidden placeholder:text-muted"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search..."
                value={search}
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
              {isEmpty ? (
                <div className="py-6 text-center text-muted text-sm">
                  No results found
                </div>
              ) : (
                <>
                  <TimezoneGroup
                    heading="Current"
                    onSelect={handleTimezoneChange}
                    options={currentGroup}
                    selected={timezone}
                  />
                  <TimezoneGroup
                    heading="Server"
                    onSelect={handleTimezoneChange}
                    options={serverGroup}
                    selected={timezone}
                  />
                  <TimezoneGroup
                    heading="Recommended"
                    onSelect={handleTimezoneChange}
                    options={recommendedGroup}
                    selected={timezone}
                  />
                  <TimezoneGroup
                    heading="All"
                    onSelect={handleTimezoneChange}
                    options={allGroup}
                    selected={timezone}
                  />
                </>
              )}
            </div>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
