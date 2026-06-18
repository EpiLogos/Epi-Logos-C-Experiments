import { assertCapabilityParity } from '../../../../common/omnipanel-runtime';

export interface CapabilityCheckCellProps {
  readonly capabilityName: string;
  readonly gatewayCapabilityNames: readonly string[];
  readonly widgetCapabilityNames: readonly string[];
  readonly pending?: boolean;
}

export function CapabilityCheckCell({
  capabilityName,
  gatewayCapabilityNames,
  widgetCapabilityNames,
  pending = false
}: CapabilityCheckCellProps) {
  if (pending) {
    return (
      <span
        className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-[var(--border-subtle)] text-[11px] text-[var(--text-tertiary)]"
        data-test={`capability-check-${capabilityName}`}
        data-parity="unknown"
        title="Capability parity has not been fetched yet."
      >
        ?
      </span>
    );
  }

  const gatewayHasCapability = gatewayCapabilityNames.includes(capabilityName);
  const parity = assertCapabilityParity(widgetCapabilityNames, gatewayCapabilityNames);
  const inParity = gatewayHasCapability && widgetCapabilityNames.includes(capabilityName) && parity.equal;
  const title = inParity
    ? 'Gateway-declared and widget-declared capability sets are in parity.'
    : `Parity drift. Missing from UI: ${parity.missingFromUi.join(', ') || 'none'}; missing from gateway: ${parity.missingFromGateway.join(', ') || 'none'}.`;

  return (
    <span
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded border text-[11px] ${
        inParity
          ? 'border-emerald-500/50 text-emerald-200'
          : 'border-red-500/50 text-red-200'
      }`}
      data-test={`capability-check-${capabilityName}`}
      data-parity={inParity ? 'pass' : 'fail'}
      title={title}
    >
      {inParity ? '✓' : '✗'}
    </span>
  );
}
