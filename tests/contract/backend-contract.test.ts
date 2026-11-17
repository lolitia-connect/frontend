import { afterAll, describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const fixture = mkdtempSync(join(tmpdir(), "frontend-contract-"));
const write = (name: string, source: string) => {
  const path = join(fixture, name);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, source);
};
write(
  "internal/types/types.go",
  'package types\ntype CheckoutResponse struct { OrderNo string `json:"order_no"` }\ntype TicketResponse struct { URL string `json:"url"` }\n'
);
write(
  "internal/logic/public/order/order.go",
  `package order
type V2OrderLogic struct {}
func (l *V2OrderLogic) Checkout() (*types.CheckoutResponse, error) { return nil, nil }
func (l *V2OrderLogic) EventTicket() (*types.TicketResponse, error) { return nil, nil }
`
);
write(
  "internal/handler/public/order/handlers.go",
  `package order
import logic "example/internal/logic/public/order"
import "example/pkg/sse"
func CheckoutHandler(ctx interface{}) func() {
  return func() { l := logic.NewV2OrderLogic(); resp, err := l.Checkout(); result.HttpResult(c, resp, err) }
}
func TicketHandler(ctx interface{}) func() {
  return func() { resp, err := logic.NewV2OrderLogic().EventTicket(); result.HttpResult(c, resp, err) }
}
func EventsHandler(ctx interface{}) func() {
  return func() { writer := sse.NewWriter(c); writer.Close() }
}
`
);
write(
  "internal/handler/routes.go",
  `package handler
import order "example/internal/handler/public/order"
func Register(router interface{}) {
  group := router.Group("/v2/public/orders")
  group.POST("/:orderNo/checkout", order.CheckoutHandler(ctx))
  group.POST("/:orderNo/event-ticket", order.TicketHandler(ctx))
  group.GET("/:orderNo/events", order.EventsHandler(ctx))
}
`
);
for (const name of ["native_routes.go", "v2_order_routes.go"])
  write(`internal/handler/${name}`, "package handler\n");
afterAll(() => rmSync(fixture, { recursive: true, force: true }));

describe("fresh backend contract extraction", () => {
  it("is deterministic and resolves the exact method and SSE media type", () => {
    const go =
      process.env.GO_BINARY ||
      (existsSync("C:/Program Files/Go/bin/go.exe")
        ? "C:/Program Files/Go/bin/go.exe"
        : "go");
    const extract = () =>
      execFileSync(
        go,
        [
          "run",
          resolve(import.meta.dir, "../../scripts/backend-contract.go"),
          fixture,
        ],
        { encoding: "utf8" }
      );
    const first = extract();
    expect(extract()).toBe(first);
    const contract = JSON.parse(first);
    expect(contract.endpoints).toEqual([
      {
        method: "POST",
        path: "/v2/public/orders/:orderNo/checkout",
        response: "CheckoutResponse",
      },
      {
        method: "POST",
        path: "/v2/public/orders/:orderNo/event-ticket",
        response: "TicketResponse",
      },
      {
        method: "GET",
        path: "/v2/public/orders/:orderNo/events",
        contentType: "text/event-stream",
      },
    ]);
  }, 60_000);
});
