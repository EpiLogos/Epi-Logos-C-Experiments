export type MediatedRunEvidenceMediator = 'codex' | 'claude' | 'hermes' | 'fable-5';

export type MediatedRunEvidenceVerdict = 'PASS' | 'FAIL' | 'REVIEW' | 'BLOCKED';

export interface MediatedRunEvidencePacket {
    readonly runId: string;
    readonly taskId: string;
    readonly mediator: MediatedRunEvidenceMediator;
    readonly verdict: MediatedRunEvidenceVerdict;
    readonly evidence: readonly string[];
    readonly acceptanceCriteria: readonly string[];
    readonly passedCriteria: readonly string[];
    readonly timestamp: number;
    readonly provenance: string;
}

export interface MediatedRunEvidenceLedger {
    readonly entries: readonly MediatedRunEvidencePacket[];
    addEntry(packet: MediatedRunEvidencePacket): MediatedRunEvidenceLedger;
    latestForTask(taskId: string): MediatedRunEvidencePacket | null;
    allPassed(): boolean;
}

function freezePacket(
    packet: MediatedRunEvidencePacket
): MediatedRunEvidencePacket {
    return Object.freeze({
        ...packet,
        evidence: Object.freeze([...packet.evidence]),
        acceptanceCriteria: Object.freeze([...packet.acceptanceCriteria]),
        passedCriteria: Object.freeze([...packet.passedCriteria])
    });
}

function createLedgerFromEntries(
    entries: readonly MediatedRunEvidencePacket[]
): MediatedRunEvidenceLedger {
    const frozenEntries = Object.freeze(entries.map(freezePacket));
    return Object.freeze({
        entries: frozenEntries,
        addEntry(packet: MediatedRunEvidencePacket): MediatedRunEvidenceLedger {
            return createLedgerFromEntries([...frozenEntries, packet]);
        },
        latestForTask(taskId: string): MediatedRunEvidencePacket | null {
            return (
                frozenEntries.reduce<MediatedRunEvidencePacket | null>(
                    (latest, packet) => {
                        if (packet.taskId !== taskId) {
                            return latest;
                        }
                        if (!latest || packet.timestamp >= latest.timestamp) {
                            return packet;
                        }
                        return latest;
                    },
                    null
                )
            );
        },
        allPassed(): boolean {
            return (
                frozenEntries.length > 0 &&
                frozenEntries.every(
                    (packet) =>
                        packet.verdict === 'PASS' &&
                        packet.acceptanceCriteria.every((criterion) =>
                            packet.passedCriteria.includes(criterion)
                        )
                )
            );
        }
    });
}

export function createEvidenceLedger(): MediatedRunEvidenceLedger {
    return createLedgerFromEntries([]);
}
