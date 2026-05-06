type EpiRoute = {
  name: string;
  command: string[];
  previewOnly?: boolean;
};

export const epiRoutes: EpiRoute[] = [
  { name: "epi_core_inspect", command: ["epi", "core", "inspect"] },
  { name: "epi_core_verify", command: ["epi", "core", "verify"], previewOnly: true },
  { name: "epi_vault_read", command: ["epi", "vault", "read"] },
  { name: "epi_graph_query", command: ["epi", "graph", "query"] },
  { name: "epi_agent_help", command: ["epi", "agent", "doctor", "--json"] },
];

export function registerTool(name = "epi_core_verify") {
  return epiRoutes.find((route) => route.name === name) ?? epiRoutes[1];
}
