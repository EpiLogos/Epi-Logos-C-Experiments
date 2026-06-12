import type { ToolStreamEvent } from '../../../../common/omnipanel-runtime';
import { formatTs } from '../panels/panelUtils';
import {
  detailToolStreamValue,
  normalizePrivacyClass
} from './toolStreamModel';

type ToolEventDetailProps = {
  event: ToolStreamEvent | null;
  onOpenDispatchTrace: (event: ToolStreamEvent) => void;
  onOpenEvidence: (event: ToolStreamEvent) => void;
};

export function ToolEventDetail({
  event,
  onOpenDispatchTrace,
  onOpenEvidence
}: ToolEventDetailProps) {
  if (!event) {
    return (
      <aside data-test="tool-event-detail-empty">
        Select a tool event.
      </aside>
    );
  }

  const privacyClass = normalizePrivacyClass(event.privacyClass);

  return (
    <aside data-test="tool-event-detail" data-privacy-class={privacyClass}>
      <header>
        <strong>{event.tool}</strong>
        <div>{formatTs(event.emittedAtMs)} / {event.actor} / {event.kind}</div>
      </header>

      <section>
        <h4>Args</h4>
        <pre>{detailToolStreamValue(event, event.args)}</pre>
      </section>

      <section>
        <h4>Return</h4>
        <pre>{detailToolStreamValue(event, event.result)}</pre>
      </section>

      {event.error !== undefined && (
        <section>
          <h4>Error</h4>
          <pre>{detailToolStreamValue(event, event.error)}</pre>
        </section>
      )}

      <footer>
        <button type="button" onClick={() => onOpenDispatchTrace(event)}>
          Dispatch Trace: {event.dispatchNodeId}
        </button>
        {event.evidencePacketRef && (
          <button type="button" onClick={() => onOpenEvidence(event)}>
            Evidence: {event.evidencePacketRef}
          </button>
        )}
      </footer>
    </aside>
  );
}
