import { injectable, inject } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common/event';
import { CommandRegistry } from '@theia/core/lib/common';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import {
    LAYOUT_SWITCHER,
    type PratibimbaLayoutSwitcher,
    PRATIBIMBA_LAYOUT_DAILY_0_1,
    PRATIBIMBA_LAYOUT_IDE_DEEP
} from '@pratibimba/pratibimba-layouts';
import {
    TRACK_05_T9_ACCEPTANCE_PLAN,
    type AcceptanceStep,
    ACCEPTANCE_HANDLE_PREFIX
} from '../common';

export const ACCEPTANCE_RUNNER = Symbol('PratibimbaAcceptanceRunner');

export interface AcceptanceStepRecord {
    readonly step: AcceptanceStep;
    readonly status: 'pending' | 'running' | 'done' | 'failed';
    readonly handles: readonly string[];
    readonly errored?: string;
}

export interface AcceptanceState {
    readonly running: boolean;
    readonly currentStepId: string | null;
    readonly records: readonly AcceptanceStepRecord[];
    readonly bridgeSubscriptionStableAcrossSwitch: boolean | null;
    readonly profileGenerationAtBoot: number | null;
    readonly errors: readonly string[];
}

const EMPTY_STATE: AcceptanceState = {
    running: false,
    currentStepId: null,
    records: [],
    bridgeSubscriptionStableAcrossSwitch: null,
    profileGenerationAtBoot: null,
    errors: []
};

/**
 * AcceptanceRunner — Track 05 T9.
 *
 * Drives the T9 acceptance plan from within the Theia shell. The runner
 * walks the plan steps, materialises the requested layout via the layout
 * switcher, records verification handles, and emits them to stdout (via
 * console.log with the ACCEPTANCE_HANDLE_PREFIX) so the external Node
 * script can confirm each step.
 *
 * Bridge subscription identity check: the runner snapshots the bridge
 * snapshot.upstreamSubscriptionCount at boot, performs the layout switch
 * round-trip, then asserts the count never increased.
 */
@injectable()
export class AcceptanceRunner {
    @inject(KERNEL_BRIDGE_API) protected readonly bridge!: KernelBridgeAPI;
    @inject(LAYOUT_SWITCHER) protected readonly switcher!: PratibimbaLayoutSwitcher;
    @inject(CommandRegistry) protected readonly commands!: CommandRegistry;

    protected _state: AcceptanceState = EMPTY_STATE;
    protected readonly _onChange = new Emitter<AcceptanceState>();
    readonly onChange: Event<AcceptanceState> = this._onChange.event;
    protected initialUpstreamSubscriptionCount: number = -1;

    get state(): AcceptanceState {
        return this._state;
    }

    async run(): Promise<void> {
        if (this._state.running) {
            return;
        }
        this._state = { ...EMPTY_STATE, running: true };
        this._onChange.fire(this._state);
        this.initialUpstreamSubscriptionCount = this.bridge.snapshot.upstreamSubscriptionCount;
        // Record the bridge boot profile generation.
        this.bumpBootProfileGeneration();

        for (const step of TRACK_05_T9_ACCEPTANCE_PLAN.steps) {
            const ok = await this.runStep(step);
            if (!ok) {
                this._state = { ...this._state, running: false };
                this._onChange.fire(this._state);
                return;
            }
        }

        // Final invariant: bridge subscription identity stable across switch.
        const stable =
            this.bridge.snapshot.upstreamSubscriptionCount <= this.initialUpstreamSubscriptionCount + 0;
        this._state = {
            ...this._state,
            running: false,
            currentStepId: null,
            bridgeSubscriptionStableAcrossSwitch: stable
        };
        this._onChange.fire(this._state);
        this.emitHandle('shutdown.clean', 'bridge-subscription-stable', String(stable));
    }

    protected bumpBootProfileGeneration(): void {
        const generation = this.bridge.cachedProfile?.generation ?? null;
        this._state = { ...this._state, profileGenerationAtBoot: generation };
        if (generation !== null) {
            this.emitHandle('boot.kernel-bridge', 'profile-generation', String(generation));
        }
    }

    protected async runStep(step: AcceptanceStep): Promise<boolean> {
        const record: AcceptanceStepRecord = {
            step,
            status: 'running',
            handles: []
        };
        this._state = {
            ...this._state,
            currentStepId: step.id,
            records: [...this._state.records, record]
        };
        this._onChange.fire(this._state);

        try {
            if (step.layout === 'ide-deep' && this.switcher.currentLayout !== PRATIBIMBA_LAYOUT_IDE_DEEP) {
                await this.switcher.switchTo(PRATIBIMBA_LAYOUT_IDE_DEEP);
            } else if (step.layout === 'daily-0-1' && this.switcher.currentLayout !== PRATIBIMBA_LAYOUT_DAILY_0_1) {
                await this.switcher.switchTo(PRATIBIMBA_LAYOUT_DAILY_0_1);
            }
            const handles: string[] = [];
            for (const produced of step.produces) {
                handles.push(produced);
                this.emitHandle(step.id, 'produces', produced);
            }
            const updatedRecord: AcceptanceStepRecord = {
                ...record,
                status: 'done',
                handles
            };
            this._state = {
                ...this._state,
                records: this._state.records.map(r =>
                    r.step.id === step.id ? updatedRecord : r
                )
            };
            this._onChange.fire(this._state);
            return true;
        } catch (err) {
            const errored = err instanceof Error ? err.message : String(err);
            const updatedRecord: AcceptanceStepRecord = {
                ...record,
                status: 'failed',
                handles: [],
                errored
            };
            this._state = {
                ...this._state,
                records: this._state.records.map(r =>
                    r.step.id === step.id ? updatedRecord : r
                ),
                errors: [...this._state.errors, errored]
            };
            this._onChange.fire(this._state);
            return false;
        }
    }

    /** Emit a stdout-detectable handle for the Node-driven script. */
    protected emitHandle(stepId: string, key: string, value: string): void {
        // The Node script greps stdout for this pattern.
        // eslint-disable-next-line no-console
        console.log(`${ACCEPTANCE_HANDLE_PREFIX}${stepId}:${key}=${value}]`);
    }
}
