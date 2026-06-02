import * as React from 'react';
import type { KernelBridgeAPI } from '@pratibimba/kernel-bridge';

/**
 * Bridge gate — gates every IDE Shell widget on kernel-bridge readiness.
 *
 * The deep IDE layout's surfaces (graph viewer, Canon Studio, Agentic Control
 * Room, coordinate tree, Logos Atelier, evidence/review/autoresearch panes)
 * MUST NOT make capability calls before the kernel-bridge is connected and
 * has a cached safe profile. This component renders an empty / pending shell
 * until those preconditions are met; once met it renders the children.
 *
 * The pattern mirrors `IntegratedBridgeGate` from `@pratibimba/integrated-composition`
 * but uses the kernel-bridge directly instead of the SharedBridgeAdapter
 * (because the M-extensions are downstream of the IDE shell — they consume
 * `SharedBridgeAdapter` which the kernel-bridge feeds).
 */
export interface IdeShellBridgeGateProps {
    readonly bridge: KernelBridgeAPI;
    readonly widgetLabel: string;
    readonly children: React.ReactNode;
}

interface BridgeGateState {
    connected: boolean;
    profileGeneration: number | null;
    reason: string;
}

export class IdeShellBridgeGate extends React.Component<IdeShellBridgeGateProps, BridgeGateState> {
    private disposers: Array<() => void> = [];

    constructor(props: IdeShellBridgeGateProps) {
        super(props);
        this.state = {
            connected: props.bridge.connectionStatus.connected,
            profileGeneration: props.bridge.cachedProfile?.generation ?? null,
            reason: props.bridge.connectionStatus.reason
        };
    }

    override componentDidMount(): void {
        this.disposers.push(
            this.props.bridge.onConnectionChange(status => {
                this.setState({ connected: status.connected, reason: status.reason });
            })
        );
        this.disposers.push(
            this.props.bridge.onProfile(profile => {
                this.setState({ profileGeneration: profile.generation });
            })
        );
    }

    override componentWillUnmount(): void {
        for (const d of this.disposers) {
            try { d(); } catch { /* best-effort */ }
        }
        this.disposers = [];
    }

    override render(): React.ReactNode {
        const ready = this.state.connected && this.state.profileGeneration !== null;
        if (!ready) {
            return (
                <div className="ide-shell-bridge-pending" data-test="ide-shell-bridge-pending">
                    <h3>{this.props.widgetLabel}</h3>
                    <p>
                        Awaiting kernel-bridge readiness. Connected:{' '}
                        <code data-test="bridge-connected">{this.state.connected ? 'yes' : 'no'}</code>
                        {' | '}
                        Profile generation:{' '}
                        <code data-test="bridge-profile-generation">
                            {this.state.profileGeneration ?? 'pending'}
                        </code>
                    </p>
                    <p className="ide-shell-pending-reason">{this.state.reason}</p>
                </div>
            );
        }
        return <>{this.props.children}</>;
    }
}
