export function matchSupportedLanguage(
  languageRange: string | undefined,
  supported: readonly string[]
) {
  if (!languageRange) return;
  const range = languageRange.toLowerCase();
  const exact = supported.find((language) => language.toLowerCase() === range);
  if (exact) return exact;

  try {
    const requested = new Intl.Locale(range).maximize();
    const candidates = supported
      .map((language) => ({
        language,
        locale: new Intl.Locale(language).maximize(),
      }))
      .filter(({ locale }) => locale.language === requested.language);

    return (
      candidates.find(
        ({ locale }) =>
          locale.script === requested.script &&
          locale.region === requested.region
      ) ??
      candidates.find(({ locale }) => locale.script === requested.script) ??
      candidates[0]
    )?.language;
  } catch {
    return;
  }
}

export function getRequestLanguage(
  acceptLanguage: string | null | undefined,
  supported: readonly string[],
  fallback: string
): string {
  const preferences = (acceptLanguage ?? "").split(",").flatMap((value) => {
    const [rawRange, ...parameters] = value.trim().split(";");
    const range = rawRange?.trim().toLowerCase();
    if (!(range && /^(?:\*|[a-z]{1,8}(?:-[a-z0-9]{1,8})*)$/.test(range)))
      return [];
    const qualityParameter = parameters.find((parameter) =>
      /^\s*q\s*=/i.test(parameter)
    );
    const quality = qualityParameter?.split("=")[1]?.trim();
    if (
      quality !== undefined &&
      !/^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(quality)
    )
      return [];
    return [{ range, quality: quality === undefined ? 1 : Number(quality) }];
  });
  const excluded = preferences.filter(({ quality }) => quality === 0);

  for (const { range } of preferences
    .filter(({ quality }) => quality > 0)
    .sort((a, b) => b.quality - a.quality)) {
    const allowed = supported.filter(
      (language) =>
        !excluded.some(({ range: blocked }) => {
          if (blocked === "*" || range.startsWith(`${blocked}-`)) return false;
          const normalized = language.toLowerCase();
          return normalized === blocked || normalized.startsWith(`${blocked}-`);
        })
    );
    const match =
      range === "*"
        ? (allowed.find((language) => language === fallback) ?? allowed[0])
        : matchSupportedLanguage(range, allowed);
    if (match) return match;
  }

  return fallback;
}
