import * as React from 'react';
import type { KernelBridgeAPI } from '@pratibimba/kernel-bridge';
import {
    BridgeReadinessBadge,
    classifyReadiness,
    readinessFromEvent,
    snapshotReadinessFromBridge,
    type BridgeReadinessBinding,
    type BridgeReadinessSource
} from '@pratibimba/m-extension-runtime/lib/common/bridge-readiness';

const ProfileTickContext = React.createContext<{ tickGeneration: number }>({ tickGeneration: 0 });

export function useProfileTick(): number {
    return React.useContext(ProfileTickContext).tickGeneration;
}

interface ProfileTickRenderBoundaryProps {
    readonly children: React.ReactNode;
}

function ProfileTickRenderBoundary({ children }: ProfileTickRenderBoundaryProps): React.ReactElement {
    const tickGeneration = useProfileTick();
    return (
        <>
            {React.Children.map(children, child => {
                if (!React.isValidElement(child)) {
                    return child;
                }
                return React.cloneElement(
                    child as React.ReactElement<Record<string, unknown>>,
                    { 'data-profile-tick-generation': tickGeneration }
                );
            })}
        </>
    );
}

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
    readiness: BridgeReadinessBinding;
    tickGeneration: number;
}

export class IdeShellBridgeGate extends React.Component<IdeShellBridgeGateProps, BridgeGateState> {
    private disposers: Array<() => void> = [];

    constructor(props: IdeShellBridgeGateProps) {
        super(props);
        this.state = {
            connected: props.bridge.connectionStatus.connected,
            profileGeneration: props.bridge.cachedProfile?.generation ?? null,
            reason: props.bridge.connectionStatus.reason,
            readiness: classifyReadiness(
                snapshotReadinessFromBridge(props.bridge as unknown as BridgeReadinessSource),
                'ide-shell.bridge'
            ),
            tickGeneration: 0
        };
    }

    override componentDidMount(): void {
        this.disposers.push(
            this.props.bridge.onConnectionChange(status => {
                this.setState({
                    connected: status.connected,
                    reason: status.reason,
                    readiness: classifyReadiness(
                        snapshotReadinessFromBridge(this.props.bridge as unknown as BridgeReadinessSource),
                        'ide-shell.bridge'
                    )
                });
            })
        );
        this.disposers.push(
            this.props.bridge.onProfile(profile => {
                this.setState(previous => ({
                    profileGeneration: profile.generation,
                    readiness: classifyReadiness(
                        snapshotReadinessFromBridge(this.props.bridge as unknown as BridgeReadinessSource),
                        'ide-shell.bridge'
                    ),
                    tickGeneration: previous.tickGeneration + 1
                }));
            })
        );
        this.disposers.push(
            this.props.bridge.onEvent(event => {
                const readiness = readinessFromEvent(event, 'ide-shell.bridge');
                if (readiness) {
                    this.setState({ readiness });
                }
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
        const bridgeUnavailable = this.state.readiness.readinessId === 'bridge_unavailable';
        if (bridgeUnavailable) {
            return (
                <ProfileTickContext.Provider value={{ tickGeneration: this.state.tickGeneration }}>
                    <div className="ide-shell-bridge-pending" data-test="ide-shell-bridge-pending">
                        <h3>
                            {this.props.widgetLabel}
                            <BridgeReadinessBadge
                                bindingKey="ide-shell.bridge"
                                bridge={this.props.bridge as unknown as BridgeReadinessSource}
                                readiness={this.state.readiness}
                            />
                        </h3>
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
                </ProfileTickContext.Provider>
            );
        }
        return (
            <ProfileTickContext.Provider value={{ tickGeneration: this.state.tickGeneration }}>
                <ProfileTickRenderBoundary>
                    {this.props.children}
                </ProfileTickRenderBoundary>
            </ProfileTickContext.Provider>
        );
    }
}
