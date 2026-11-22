import type { TFunction } from "i18next";
import { z } from "zod";

export function nekoproxyOptionsSchema(t: TFunction) {
  const required = t("nodes:np.required", "Complete the forwarding settings");
  const portError = t(
    "nodes:errors.portRange",
    "Port must be between 1 and 65535"
  );
  return z
    .union([
      z
        .object({
          forward_id: z.string().min(1, required),
          session_id: z.string().min(1, required),
        })
        .strict(),
      z
        .object({
          create: z.object({
            chain_id: z.string().min(1, required),
            entry_group_id: z.string().min(1, required),
            protocol: z.enum(["tcp", "udp", "tcp_udp"]),
            target_host: z.string().trim().min(1, required).max(255),
            target_port: z
              .number()
              .int()
              .min(1, portError)
              .max(65_535, portError),
            target_port_manual: z.boolean().optional(),
            requested_port: z.number().int().min(0).max(65_535),
          }),
        })
        .strict(),
    ])
    .optional();
}
