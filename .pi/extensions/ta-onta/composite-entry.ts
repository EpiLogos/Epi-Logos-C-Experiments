import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export async function main(api: ExtensionAPI) {
  const { default: pluginRuntimeBridge } = await import("./plugin-runtime-bridge.ts");
  // Load 6 S4-X' extensions in dependency order
  const { khoraExtension } = await import("./khora/extension.ts");
  const { henExtension } = await import("./hen/extension.ts");
  const { pleromaExtension } = await import("./pleroma/extension.ts");
  const { chronosExtension } = await import("./chronos/extension.ts");
  const { animaExtension } = await import("./anima/extension.ts");
  const { aletheiaExtension } = await import("./aletheia/extension.ts");

  await pluginRuntimeBridge(api);
  await khoraExtension(api);
  await henExtension(api);
  await pleromaExtension(api);
  await chronosExtension(api);
  await animaExtension(api);
  await aletheiaExtension(api);
}

export default async function taOntaCompositeEntry(api: ExtensionAPI) {
  await main(api);
}
