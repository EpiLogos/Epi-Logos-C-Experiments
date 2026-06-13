import type { ReactNode } from 'react';
import type { IOD17Parity } from '../../../../common/omnipanel-runtime';

// Track 27 T27.6 — IOD-17 three-way parity readout.
//
// Renders the capability-matrix ↔ agent-contract ↔ widget bijection as three
// cells. When the item is out of parity (`inParity === false`) a red drift
// banner is shown and committal verdicts are blocked upstream. This is a
// read-only inline surface — there are no overlay affordances of any kind.

export type IOD17ParityReadoutProps = {
  parity: IOD17Parity;
  compact?: boolean;
};

export function IOD17ParityReadout({ parity, compact = false }: IOD17ParityReadoutProps) {
  const inParity = parity.inParity !== false;
  return (
    <section
      className="rounded border border-[var(--border-subtle)] bg-white/5"
      data-test="iod17-parity-readout"
      data-in-parity={inParity ? 'true' : 'false'}
    >
      {!inParity && (
        <div
          className="px-3 py-2 text-xs font-semibold text-red-200 bg-red-500/20 border-b border-red-400/40 rounded-t"
          data-test="iod17-parity-drift-banner"
          role="alert"
        >
          IOD-17 parity drift — capability matrix, agent contract, and widget states disagree.
          {parity.drift && parity.drift.length > 0 && (
            <span className="block mt-1 font-normal text-[10px] text-red-100/90">
              {parity.drift.join(' · ')}
            </span>
          )}
        </div>
      )}
      <div className={`grid grid-cols-3 gap-2 p-3 ${compact ? 'text-[10px]' : 'text-xs'}`}>
        <ParityCell
          label="capabilityMatrixState"
          value={parity.capabilityMatrixState}
          inParity={inParity}
        />
        <ParityCell
          label="agentContractState"
          value={parity.agentContractState}
          inParity={inParity}
        />
        <ParityCell label="widgetState" value={parity.widgetState} inParity={inParity} />
      </div>
    </section>
  );
}

function ParityCell({
  label,
  value,
  inParity
}: {
  label: string;
  value: string;
  inParity: boolean;
}): ReactNode {
  return (
    <div
      className={`min-w-0 rounded border px-2 py-1.5 ${
        inParity
          ? 'border-emerald-400/40 bg-emerald-500/10'
          : 'border-red-400/50 bg-red-500/10'
      }`}
      data-test={`iod17-parity-cell-${label}`}
    >
      <div className="text-[9px] uppercase tracking-wide text-[var(--text-tertiary)]">{label}</div>
      <div className="mt-0.5 font-mono truncate" title={value}>
        {value}
      </div>
    </div>
  );
}

/** Inline status indicator for the header — green=parity, red=drift. */
export function IOD17ParityStatusBadge({ parity }: { parity: IOD17Parity | null | undefined }) {
  const inParity = parity?.inParity !== false;
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded border ${
        inParity
          ? 'border-emerald-400/50 text-emerald-200'
          : 'border-red-400/60 text-red-200'
      }`}
      data-test="iod17-parity-status-indicator"
      data-in-parity={inParity ? 'true' : 'false'}
      title={
        inParity
          ? 'IOD-17 three-way parity in sync'
          : 'IOD-17 parity drift — committal verdicts blocked'
      }
    >
      IOD-17: {inParity ? 'parity' : 'drift'}
    </span>
  );
}
