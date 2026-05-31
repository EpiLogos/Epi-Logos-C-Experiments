import { act } from 'react';
import ReactDOM from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { EpiiConversationSurface } from './EpiiDashboard';
import type {
  AgentDescriptor,
  KernelProfileObservationEvent,
  NaraActivityEvent,
  PortalRuntimeState,
} from '@/services/types';

const testGlobals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
testGlobals.IS_REACT_ACT_ENVIRONMENT = true;

function runtimeFixture(): PortalRuntimeState {
  return {
    day_id: '30-05-2026',
    now_path: 'Idea/Empty/Present/30-05-2026/20260530-120000-epii/now.md',
    kernel: {
      coordinateOwner: 'S0/QL-meta',
      projectionOwner: "S3'",
      privacy: 'safe-public-current-kernel-tick',
      computationSource: 'portal-core::KernelProjection',
      generation: 44,
      tick: {
        cycle: 2,
        subTick: 7,
        phase: 'Ascent',
        element: 'InverseMobius',
        position6: 4,
        harmonicRatio: '0.750000',
      },
      harmonicPulse: {
        cycle: 2,
        subTick: 7,
        phase: 'Ascent',
        element: 'InverseMobius',
        ratioNum: 3,
        ratioDen: 4,
        tempoMultiplier: '0.750000',
        periodMultiplier: '1.333333',
      },
      energy: {
        totalEnergy: '0.270000',
      },
      harmonicProfile: {
        tick: 34,
        tick12: 10,
        cycle: 2,
        degree720: 600,
        degree360: 240,
        su2Layer: 'shadow',
        phase: 'Ascent',
        position6: 4,
        helix: 'pratibimba',
        ratioRole: '3/2 perfect-fifth aspiration',
        lensMode: {
          lens: 10,
          mode: 5,
        },
        chromatic: {
          position: 4,
          pitchClass: 9,
          note: 'A',
          xPrimePitchClass: 8,
          xPrimeNote: 'G#',
          mirrorPosition: 1,
          mirrorPitchClass: 3,
          mirrorNote: 'D#',
          mirrorSquare: 'Sq2',
          mirrorSpanWholeTones: 3,
          mirrorSpanSemitones: 6,
        },
        resonance72: {
          legacyResonanceIndex: 58,
          lensAnchorIndex: 64,
          baseLens: 4,
          helixBit: 1,
          lensAnchor: 10,
          position: 4,
        },
        audioOctet: [110, 123.47, 138.59, 146.83, 164.81, 185, 207.65, 220],
        nodalQuartet: [
          { qlPosition: 0, helix: 'bimba', m: 7, n: 8 },
          { qlPosition: 5, helix: 'bimba', m: 4, n: 2 },
          { qlPosition: 0, helix: 'pratibimba', m: 8, n: 4 },
          { qlPosition: 5, helix: 'pratibimba', m: 5, n: 6 },
        ],
        elements: {
          pPositionElement: 'Earth',
          l2PrimeElement: 'Fire',
          renderingRole: 'explicate-sounded',
        },
        planetaryChakral: {
          body: 'Uranus',
          chakraRole: 'Ajna transpersonal extension',
          element: 'Light/Air',
          musicalRole: '5/3 major sixth',
          modalColor: 'Nahawand / disruptive insight',
          provenance:
            "initial M2/M' alignment; canonical values must be governed by S2 graph law",
        },
        diatonic: {
          degree: 6,
          pitchClass: 9,
          note: 'A',
          contextFrame: '4.5/0',
          contextAgent: 'Psyche',
          vakRegister: 'partial-Aletheia',
        },
        binary: {
          mahamayaAddress64: 42,
          codon: 'GGG',
          hexagram: 'H43',
          lineChangeOperator: 'H43.5',
          hexagramId: 42,
          upperTrigram: 5,
          lowerTrigram: 2,
          codonId: 42,
          nucleotideBits: [3, 3, 3],
          dnaRnaPhase: 'RNA',
          lineIndex: 4,
          lineChangeOperatorAddress: 256,
          m2VibrationIndex: 64,
          m2ToM3Symbol: 56,
          evolutionaryGap: true,
          tarotMinorId: null,
          tarotShadowCodon: null,
          aminoAcidCode: null,
          datasetLutState: 'materialized-kernel-lut',
          transcriptionState: 'provisional-gap',
          frameBreathingRole: 'sq2-active-tritone',
          m3CodecProvenance:
            'portal-core::mahamaya address law; tarot/amino LUTs pending',
        },
        codonRotationProjection: {
          lens: 10,
          mode: 5,
          lensLabel: "L4'",
          modeName: 'Aeolian',
          surfaceIndex: 421,
          codonId: 57,
          codon: 'GCT',
          codonClass: 'dual',
          rotation: 5,
          rotationalStateCount: 8,
          rotationDegrees: 225,
          reverseLens: 10,
          reverseMode: 5,
          datasetLutState: 'materialized-kernel-lut',
          provenance: 'portal-core::codon_rotation_projection 84↔472 surface LUT',
        },
        qCosmic: [0.75, -0.25, 0.5, 0.35],
        resonance: 0.82,
        conjugateFormCharacter: 'Major',
        privacyClass: 'public-current-context',
        bedrock: {
          hashOperator: '#',
          psychoidNumber: '#4',
          invertedPsychoidNumber: "#4'",
          successorPsychoidNumber: '#5',
          successorRelation: 'epogdoon-tick',
          inversionRelation: 'inversion-spanda',
          bimbaPitchClass: 8,
          inversionPitchClass: 9,
        },
        pointerAnchor: {
          sourceCoordinate: 'S0/QL-meta',
          qlPosition: 4,
          helix: 'pratibimba',
          webIndex: 10,
          bedrockIndex: 4,
          familyRingSize: 12,
          positionRingSize: 12,
          lensRingSize: 12,
          webCardinality: 36,
          lensAnchor: "L4'",
          relationRole: 'inversion-spanda',
          pitchClass: 9,
          provenance: 'S0 Bedrock7/PointerWeb36/CF7 harmonic pointer contract',
        },
        contextFrames: {
          frameCount: 7,
          activeFrameIndex: 5,
          activeFrame: '4.5/0',
          activeAgent: 'Psyche',
          projection: 'CF7 diatonic lemniscate overlay',
        },
      },
    },
  };
}

function activityFixture(): NaraActivityEvent {
  return {
    eventId: 'activity-1',
    kind: 'Journal',
    coordinate: 'M4-4',
    dayId: '30-05-2026',
    nowPath: 'Idea/Empty/Present/30-05-2026/20260530-120000-epii/now.md',
    sessionKey: 'agent:main:main',
    sourceRef: '[[Daily Note]]',
    privacy: 'protected-local-body',
    identityRef: 'identity-hash-only',
    mathemeHandle: 'matheme-profile-118',
    kairosSnapshot: 'kairos://snapshot/118',
    rawBodyHandle: 'protected://nara/activity-1',
    derivedSymbolicObservation: {
      observationKind: 'HeuristicDerived',
      detectedActivityKind: 'Journal',
      wordCount: 28,
      lineCount: 2,
      mentionedCoordinates: ["M2-1'", 'M4'],
      mentionedLenses: [7],
      mentionedPositions: [4],
      mentionedOracleMarkers: ['tarot', 'i-ching', 'oracle'],
      emotionalValenceHint: 'mixed',
      privacyClass: 'protected-local-derived',
      stateEffect: { kind: 'EphemeralContextOnly' },
      confidence: 1,
      heuristicBasis: [
        'coordinate-mentions',
        'lens-mentions',
        'position-mentions',
        'oracle-markers',
        'transparent-valence-keywords',
      ],
    },
    stateEffect: { kind: 'EphemeralContextOnly' },
    provenance: 'portal-core::NaraActivityEvent protected activity envelope',
  };
}

function profileObservationFixture(): KernelProfileObservationEvent {
  return {
    eventId: 'profile-observation-1',
    sourceAgent: 'anima',
    sessionKey: 'agent:main:main',
    namespaceRef: 'pratibimba-test',
    dayId: '30-05-2026',
    vaultNowPath: 'Idea/Empty/Present/30-05-2026/20260530-120000-epii/now.md',
    sourceCoordinate: 'M2',
    tick12: 10,
    degree720: 600,
    resonance72Index: 64,
    mahamayaAddress64: 42,
    privacy: 'protected-local-derived',
    profilePrivacyClass: 'public-current-context',
    harmonicMedium: 'portal-core::MathemeHarmonicProfile',
    coordinateAnchor: {
      coordinate: 'M2',
      coordinate_anchor: {
        coordinate: 'M2',
        kernel: {
          source: 's0.kernel',
          profile: 'portal-core::MathemeHarmonicProfile',
          generation: 44,
          projection_owner: "S3'",
        },
        harmonic_pointer: {
          source_profile: 'portal-core::MathemeHarmonicProfile',
          source_contract: 'S0 Bedrock7/PointerWeb36/CF7',
          bedrock: {
            psychoid_number: '#4',
            inverted_psychoid_number: "#4'",
            successor_psychoid_number: '#5',
            successor_relation: 'epogdoon-tick',
            inversion_relation: 'inversion-spanda',
          },
          pointer_anchor: {
            source_coordinate: 'S0/QL-meta',
            ql_position: 4,
            helix: 'pratibimba',
            web_index: 10,
            web_cardinality: 36,
            lens_anchor: "L4'",
            relation_role: 'inversion-spanda',
            pitch_class: 9,
          },
          context_frames: {
            cf_cardinality: 7,
            active_frame_index: 5,
            active_frame: '4.5/0',
            active_agent: 'Psyche',
            projection: 'CF7 diatonic lemniscate overlay',
          },
          provenance: 'S0 Bedrock7/PointerWeb36/CF7 harmonic pointer contract',
        },
      },
    },
  };
}

const specialists: AgentDescriptor[] = [
  {
    name: 'epii-synthesizer',
    coordinate: 'M5-4',
    description: 'Epii synthesis agent',
    capabilities: ['mef_analysis', 'graph_write'],
  },
];

function renderSurface() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);

  act(() => {
    root.render(
      <EpiiConversationSurface
        runtime={runtimeFixture()}
        latestNaraActivity={activityFixture()}
        latestProfileObservation={profileObservationFixture()}
        conversationStatus="pending"
        specialists={specialists}
      />,
    );
  });

  return {
    container,
    unmount() {
      act(() => root.unmount());
      container.remove();
    },
  };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('EpiiConversationSurface', () => {
  it('renders a conversational default view from canonical runtime context', () => {
    const { container, unmount } = renderSurface();

    expect(container.textContent).toContain("I'm reading the current matheme through the shared harmonic profile");
    expect(container.textContent).toContain('The present tone is A');
    expect(container.textContent).toContain('Latest Nara signal');
    expect(container.textContent).toContain('Latest profile deposit');
    expect(container.textContent).not.toContain('No events yet');
    expect(container.textContent).not.toContain('Library');
    unmount();
  });

  it('keeps the technical inspector hidden until the user explicitly opens it', () => {
    const { container, unmount } = renderSurface();

    expect(container.textContent).not.toContain('Codon rotation');
    expect(container.textContent).not.toContain('qCosmic');

    const inspectorButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Open inspector'),
    );
    expect(inspectorButton).toBeTruthy();

    act(() => {
      inspectorButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Codon rotation');
    expect(container.textContent).toContain('qCosmic');
    expect(container.textContent).toContain('tick12');
    unmount();
  });

  it('shows an honest pending state when the conversational backend is not live', () => {
    const { container, unmount } = renderSurface();

    const continueButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Continue reflection'),
    );
    expect(continueButton).toBeTruthy();

    act(() => {
      continueButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Conversation backend pending');
    expect(container.textContent).toContain('Specialists are registered');
    expect(container.textContent).not.toContain('assistant:');
    unmount();
  });

  it('never renders private identity or raw journal body fields', () => {
    const { container, unmount } = renderSurface();
    const text = container.textContent ?? '';

    expect(text).not.toContain('qPersonal');
    expect(text).not.toContain('q_personal');
    expect(text).not.toContain('identityHash');
    expect(text).not.toContain('identity-hash-only');
    expect(text).not.toContain('natalChartHandle');
    expect(text).not.toContain('Morning return through M2-1');
    expect(text).not.toContain('raw birth');
    unmount();
  });
});
