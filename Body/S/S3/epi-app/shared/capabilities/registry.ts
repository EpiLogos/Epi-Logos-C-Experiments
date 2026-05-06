import type { CapabilityId, CapabilityProvider } from './contracts';

export class CapabilityRegistry {
  private readonly providers = new Map<CapabilityId, CapabilityProvider>();

  register(capability: CapabilityId, provider: CapabilityProvider): void {
    this.providers.set(capability, provider);
  }

  resolve(capability: CapabilityId): CapabilityProvider {
    const provider = this.providers.get(capability);
    if (!provider) {
      throw new Error(`No provider registered for capability: ${capability}`);
    }
    return provider;
  }
}
