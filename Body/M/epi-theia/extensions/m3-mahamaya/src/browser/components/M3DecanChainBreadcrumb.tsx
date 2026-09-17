import * as React from 'react';
import type { M3ProjectionSurface } from '../../common';
import {
    M3DecanChain,
    M3DecanChainLink,
    M3DecanChainResolver,
    M3_DECAN_CHAIN_STEPS
} from '../services/TarotDecanService';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

// M3 Mahāmāyā — decan-tarot chain breadcrumb.
//
// Renders the canonical eight-link medicine chain for the active Tarot card:
//
//   card → suit → codon → decan → planet → element → chakra → body zone
//
// The breadcrumb is presentational. The chain itself is resolved by the
// injectable {@link M3DecanChainResolver} (TarotDecanService), which turns to the
// protected S2 scalar-oracle ref over the kernel bridge and looks the final body
// zone up in the single `CHAKRA_BODY_ZONES[8]` LUT. The renderer never reaches
// into a kernel crate (the S0 crates, the M4 oracle/medicine modules, and the
// portal core are forbidden imports) — it only ever displays the chain the
// resolver returns.

export const M3_DECAN_CHAIN_BREADCRUMB_WIDGET_ID = 'pratibimba.m3-mahamaya:decan-chain-breadcrumb';
export const M3_DECAN_CHAIN_STEP_COUNT = M3_DECAN_CHAIN_STEPS.length;

export interface M3DecanChainBreadcrumbProps {
    readonly surface: M3ProjectionSurface;
    /** Resolver used to turn a card key into the decan chain. */
    readonly resolver?: M3DecanChainResolver;
    /** Card key to walk. Falls back to the active projection's tarot card. */
    readonly cardKey?: string;
    /** Pre-resolved chain. When supplied, the resolver is not invoked. */
    readonly chain?: M3DecanChain | null;
    /** Notified whenever a chain is resolved through the resolver. */
    readonly onResolve?: (chain: M3DecanChain) => void;
}

export const M3DecanChainBreadcrumb: React.FC<M3DecanChainBreadcrumbProps> = ({
    surface,
    resolver,
    cardKey,
    chain,
    onResolve
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();

    const activeCardKey = cardKey ?? activeCardKeyFromSurface(surface);
    const [resolvedChain, setResolvedChain] = React.useState<M3DecanChain | null>(chain ?? null);

    React.useEffect(() => {
        // An explicit chain prop wins — skip resolution entirely.
        if (chain !== undefined) {
            setResolvedChain(chain);
            return;
        }
        if (!resolver || !activeCardKey) {
            setResolvedChain(null);
            return;
        }
        let cancelled = false;
        void resolver
            .resolveChain(activeCardKey)
            .then(next => {
                if (cancelled) {
                    return;
                }
                setResolvedChain(next);
                onResolve?.(next);
            })
            .catch(() => {
                if (!cancelled) {
                    setResolvedChain(null);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [resolver, activeCardKey, chain, onResolve]);

    const effectiveChain = chain !== undefined ? chain : resolvedChain;
    const resolvedCount = effectiveChain
        ? effectiveChain.links.filter(l => l.state === 'resolved').length
        : 0;
    const chainState = effectiveChain && resolvedCount === M3_DECAN_CHAIN_STEP_COUNT ? 'ready' : 'pending';

    return (
        <article
            className="m3-decan-chain-breadcrumb"
            data-widget-id={M3_DECAN_CHAIN_BREADCRUMB_WIDGET_ID}
            data-rpc-method={'s2.codon.scalar_ref.read'}
            data-card-key={activeCardKey ?? ''}
            data-chain-source={effectiveChain?.source ?? 'pending'}
            data-step-count={M3_DECAN_CHAIN_STEP_COUNT}
            data-resolved-count={resolvedCount}
            data-chakra-id={effectiveChain?.chakraId ?? ''}
            data-profile-generation={surface.profileGeneration}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>Decan chain</h3>
                    <p style={subtitleStyle}>
                        card → suit → codon → decan → planet → element → chakra → body zone
                    </p>
                </div>
                <ReadinessChip
                    bindingKey="surface.activeProjection.tarotCardKey"
                    state={chainState}
                    style={chipStyle}
                >
                    {effectiveChain ? `${resolvedCount}/${M3_DECAN_CHAIN_STEP_COUNT}` : 'no card'}
                </ReadinessChip>
            </header>

            {effectiveChain ? (
                <ol
                    aria-label="Decan-tarot chain, card to body zone"
                    style={chainStyle}
                >
                    {effectiveChain.links.map((linkModel, index) => (
                        <ChainLink
                            key={linkModel.step}
                            link={linkModel}
                            isLast={index === effectiveChain.links.length - 1}
                        />
                    ))}
                </ol>
            ) : (
                <ReadinessChip
                    bindingKey="surface.activeProjection.tarotCardKey"
                    state="pending"
                    style={pendingStyle}
                >
                    Turn to a Tarot card to walk the decan chain
                </ReadinessChip>
            )}
        </article>
    );
};

export default M3DecanChainBreadcrumb;

const ChainLink: React.FC<{
    readonly link: M3DecanChainLink;
    readonly isLast: boolean;
}> = ({ link, isLast }) => {
    const resolved = link.state === 'resolved';
    return (
        <li
            role="listitem"
            className="m3-decan-chain-breadcrumb-link"
            data-test="m3-decan-chain-breadcrumb-link"
            data-step={link.step}
            data-state={link.state}
            style={linkItemStyle}
        >
            <span
                title={link.detail ?? link.label}
                style={resolved ? chipResolvedStyle : chipPendingStyle}
            >
                <span style={stepLabelStyle}>{link.label}</span>
                <span style={stepValueStyle}>{link.value ?? '—'}</span>
            </span>
            {!isLast && (
                <span aria-hidden="true" style={separatorStyle}>
                    →
                </span>
            )}
        </li>
    );
};

// ============================================================================
// Domain helpers
// ============================================================================

/** Derive the active Tarot card key from the projection surface. */
function activeCardKeyFromSurface(surface: M3ProjectionSurface): string | undefined {
    const value = surface.activeProjection.tarotCardKey;
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

// ============================================================================
// Styles
// ============================================================================

const rootStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 12,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)',
    minWidth: 320
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size2)',
    fontWeight: 600
};

const subtitleStyle: React.CSSProperties = {
    margin: '4px 0 0',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)'
};

const chipStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)',
    whiteSpace: 'nowrap'
};

const pendingStyle: React.CSSProperties = {
    display: 'block',
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: 8,
    fontSize: 'var(--theia-ui-font-size1)'
};

const chainStyle: React.CSSProperties = {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4
};

const linkItemStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4
};

const chipBaseStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 1,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: '3px 8px',
    lineHeight: 1.15
};

const chipResolvedStyle: React.CSSProperties = {
    ...chipBaseStyle,
    background: 'var(--theia-editor-background)',
    color: 'var(--theia-foreground)',
    borderColor: 'var(--theia-focusBorder)'
};

const chipPendingStyle: React.CSSProperties = {
    ...chipBaseStyle,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-descriptionForeground)',
    borderStyle: 'dashed'
};

const stepLabelStyle: React.CSSProperties = {
    fontSize: 'var(--theia-ui-font-size0)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--theia-descriptionForeground)'
};

const stepValueStyle: React.CSSProperties = {
    fontSize: 'var(--theia-ui-font-size1)',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums'
};

const separatorStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)',
    userSelect: 'none'
};
