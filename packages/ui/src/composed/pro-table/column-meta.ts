export interface ProTableColumnMeta {
  /**
   * Cap this column at `maxWidth` px and reveal the hidden remainder in a hover
   * tooltip. Omit to fall back to automatic detection (see
   * `isNetworkAddressColumn`). Undefined means "no cap" for ordinary columns.
   */
  maxWidth?: number;
  /** Override the tooltip text. Defaults to the cell's own rendered text. */
  tooltip?: string;
  /**
   * Set to `false` to opt this column out of the cap + tooltip entirely, even
   * when its id/accessorKey looks like a network address.
   */
  truncate?: boolean;
}

/**
 * Column widths are capped only for network addresses (IPs, hosts, URLs), which
 * are the columns that otherwise stretch a table to an unreadable width. Cap in
 * px; the full value stays available in the tooltip.
 */
export const DEFAULT_NETWORK_ADDRESS_MAX_WIDTH = 240;

/**
 * Tokens that mark a column as carrying a network address / endpoint. Matched
 * against the column id and `accessorKey`, so `region_ip`, `address_port`,
 * `target_url`, `notify_url` and `download_link` all qualify.
 */
const NETWORK_ADDRESS_TOKENS = new Set([
  "ip",
  "ips",
  "addr",
  "address",
  "host",
  "hostname",
  "domain",
  "url",
  "uri",
  "link",
  "endpoint",
  "origin",
  "port",
]);

/**
 * Identity tokens. A column such as `server_id`, `user_id` or `subscribe_id`
 * names an entity, not an address, so it is never auto-capped — even though its
 * id contains an address-ish word (`server`, `node`).
 */
const IDENTITY_TOKENS = new Set(["id", "ids", "uuid", "no"]);

/** Split `region_ip` / `notifyUrl` / `address-port` into lowercase tokens. */
function tokenize(value: string): string[] {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Minimal structural view of the column this module needs. */
interface ColumnLike {
  columnDef: {
    accessorKey?: unknown;
    meta?: { proTable?: ProTableColumnMeta };
  };
  id: string;
}

function columnTokens(column: ColumnLike): string[] {
  const accessorKey = column.columnDef.accessorKey;
  return [
    ...tokenize(column.id),
    ...(typeof accessorKey === "string" ? tokenize(accessorKey) : []),
  ];
}

/**
 * Heuristic: does this column render a network address? Exported so the rule is
 * inspectable and reusable, and so callers can drive explicit `meta.proTable`.
 */
export function isNetworkAddressColumn(column: ColumnLike): boolean {
  const tokens = columnTokens(column);
  if (tokens.length === 0) return false;

  const last = tokens.at(-1);
  if (last !== undefined && IDENTITY_TOKENS.has(last)) return false;

  return tokens.some((token) => NETWORK_ADDRESS_TOKENS.has(token));
}

/**
 * Resolve the cap for a column:
 *   1. explicit `meta.proTable.maxWidth`,
 *   2. explicit `meta.proTable.truncate === false` (opt out),
 *   3. automatic network-address detection,
 *   4. otherwise no cap — the column uses the available width.
 */
export function resolveColumnMaxWidth(column: ColumnLike): number | undefined {
  const meta = column.columnDef.meta?.proTable;
  if (meta?.truncate === false) return;
  if (typeof meta?.maxWidth === "number") return meta.maxWidth;
  return isNetworkAddressColumn(column)
    ? DEFAULT_NETWORK_ADDRESS_MAX_WIDTH
    : undefined;
}
