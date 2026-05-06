import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export async function main(api: ExtensionAPI) {
  const { default: taOntaCompositeEntry } = await import("./extensions/ta-onta/composite-entry.ts");
  await taOntaCompositeEntry(api);
}

export default async function compositeEntry(api: ExtensionAPI) {
  await main(api);
}
