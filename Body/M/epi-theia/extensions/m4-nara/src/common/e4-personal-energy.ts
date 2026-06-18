export const E4_LOCAL_ONLY_PRIVACY_CLASS = 'local-only' as const;
export const E4_PERSONAL_SUBSTRATE_DECISION = 'E_4 = personal/Nara substrate. Final.' as const;

export type E4LocalOnlyPrivacyClass = typeof E4_LOCAL_ONLY_PRIVACY_CLASS;
export type NaraLoraRuntime = 'mlx-lora' | 'rust-native';

export interface E4PasuSnapshot {
    readonly q_identity: readonly [number, number, number, number];
    readonly q_personal: readonly [number, number, number, number];
    readonly birth_date: string;
    readonly birth_location: string;
    readonly c_0_natal_chart_path: string;
    readonly c_2_jungian: string;
    readonly c_3_gene_keys: string;
    readonly c_4_human_design: string;
    readonly c_5_quintessence_hash: string;
    readonly c_5_quintessence_clock: string;
    readonly c_4_last_wound: string;
}

export interface E4OracleCharges {
    readonly pp: number;
    readonly mm: number;
    readonly mp: number;
    readonly pn: number;
}

export interface E4KairosState {
    readonly planet_degrees: readonly [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number
    ];
    readonly oracle_charges: E4OracleCharges;
    readonly tarot_psyche_anchor_signature: string;
    readonly kairos_window_id: string;
}

export interface E4LoraCheckpointRef {
    readonly path: string;
    readonly version: string;
    readonly privacy_class: E4LocalOnlyPrivacyClass;
}

export interface E4CorpusDigest {
    readonly journal_hashes: readonly string[];
    readonly dream_hashes: readonly string[];
    readonly phone_writing_hashes: readonly string[];
    readonly model_version_key: string;
}

export interface E4PersonalInputs {
    readonly pasuSnapshot: E4PasuSnapshot;
    readonly kairos: E4KairosState;
    readonly lora_checkpoint: E4LoraCheckpointRef;
    readonly corpus: E4CorpusDigest;
}

export interface E4KernelCandidateState {
    readonly q_b: readonly [number, number, number, number];
    readonly q_p: readonly [number, number, number, number];
    readonly mathemeHarmonicProfile?: Readonly<Record<string, unknown>>;
}

export interface E4RuntimeTarget {
    readonly platform?: string;
    readonly arch?: string;
}

export interface E4EnergyProvenance {
    readonly channel: 'E_4';
    readonly runtime: NaraLoraRuntime;
    readonly privacyClass: E4LocalOnlyPrivacyClass;
    readonly checkpointVersion: string;
    readonly kairosWindowId: string;
    readonly weightingCoefficient: 4;
    readonly decision: typeof E4_PERSONAL_SUBSTRATE_DECISION;
    readonly modelSlotSpecRef: "[[M'-MODEL-SLOT-SPEC]]";
    readonly mlSkillSurfaceRef: "[[M'-ML-SKILL-SURFACE-SPEC]] §3.1 + §3.2 + §7.1";
    readonly mentalPoleMechanicsRef: "[[M4'/mental-pole-mechanics]] §7.5 ∇E_4";
    readonly autogradPath: 'rust-native-nara-lora-forward';
}

export interface E4EnergyEvaluation {
    readonly scalar: number;
    readonly loraForward: readonly [number, number, number, number];
    readonly provenance: E4EnergyProvenance;
}

export interface E4GradientEvaluation {
    readonly channel: 'E_4';
    readonly gradient: readonly [number, number, number, number];
    readonly norm: number;
    readonly scalar: number;
    readonly provenance: E4EnergyProvenance;
}

export function createE4PersonalInputs(input: E4PersonalInputs): E4PersonalInputs {
    const pasuSnapshot: E4PasuSnapshot = Object.freeze({
        q_identity: freezeQuaternion('q_identity', input.pasuSnapshot.q_identity),
        q_personal: freezeQuaternion('q_personal', input.pasuSnapshot.q_personal),
        birth_date: requireNonEmpty('birth_date', input.pasuSnapshot.birth_date),
        birth_location: requireNonEmpty('birth_location', input.pasuSnapshot.birth_location),
        c_0_natal_chart_path: requireNonEmpty('c_0_natal_chart_path', input.pasuSnapshot.c_0_natal_chart_path),
        c_2_jungian: requireString('c_2_jungian', input.pasuSnapshot.c_2_jungian),
        c_3_gene_keys: requireString('c_3_gene_keys', input.pasuSnapshot.c_3_gene_keys),
        c_4_human_design: requireString('c_4_human_design', input.pasuSnapshot.c_4_human_design),
        c_5_quintessence_hash: requireString('c_5_quintessence_hash', input.pasuSnapshot.c_5_quintessence_hash),
        c_5_quintessence_clock: requireString('c_5_quintessence_clock', input.pasuSnapshot.c_5_quintessence_clock),
        c_4_last_wound: requireString('c_4_last_wound', input.pasuSnapshot.c_4_last_wound)
    });
    const kairos: E4KairosState = Object.freeze({
        planet_degrees: freezePlanetDegrees(input.kairos.planet_degrees),
        oracle_charges: freezeOracleCharges(input.kairos.oracle_charges),
        tarot_psyche_anchor_signature: requireString(
            'tarot_psyche_anchor_signature',
            input.kairos.tarot_psyche_anchor_signature
        ),
        kairos_window_id: requireNonEmpty('kairos_window_id', input.kairos.kairos_window_id)
    });
    const loraCheckpoint = freezeLoraCheckpoint(input.lora_checkpoint);
    const corpus: E4CorpusDigest = Object.freeze({
        journal_hashes: freezeHashList('journal_hashes', input.corpus.journal_hashes),
        dream_hashes: freezeHashList('dream_hashes', input.corpus.dream_hashes),
        phone_writing_hashes: freezeHashList('phone_writing_hashes', input.corpus.phone_writing_hashes),
        model_version_key: requireNonEmpty('model_version_key', input.corpus.model_version_key)
    });
    return Object.freeze({
        pasuSnapshot,
        kairos,
        lora_checkpoint: loraCheckpoint,
        corpus
    });
}

export function selectNaraLoraRuntime(target: E4RuntimeTarget = {}): NaraLoraRuntime {
    const platform = target.platform ?? globalProcessValue('platform');
    const arch = target.arch ?? globalProcessValue('arch');
    return platform === 'darwin' && arch === 'arm64' ? 'mlx-lora' : 'rust-native';
}

export function computeE4PersonalEnergy(
    state: E4KernelCandidateState,
    inputs: E4PersonalInputs,
    options: { readonly runtime?: NaraLoraRuntime } = {}
): E4EnergyEvaluation {
    const normalizedInputs = createE4PersonalInputs(inputs);
    const normalizedState = freezeState(state);
    const runtime = options.runtime ?? selectNaraLoraRuntime();
    const loraForward = naraLoraForward(normalizedState, normalizedInputs);
    const scalar =
        (squaredDistance(loraForward, normalizedInputs.pasuSnapshot.q_personal) +
            squaredDistance(normalizedState.q_b, normalizedInputs.pasuSnapshot.q_identity) +
            kairosCoherencePenalty(normalizedInputs.kairos) +
            corpusAdapterPenalty(normalizedInputs.corpus)) /
        4;
    return Object.freeze({
        scalar: finiteScalar('E_4 scalar', scalar),
        loraForward,
        provenance: provenanceFor(runtime, normalizedInputs)
    });
}

export function computeE4PersonalEnergyGradient(
    state: E4KernelCandidateState,
    inputs: E4PersonalInputs,
    options: { readonly runtime?: NaraLoraRuntime } = {}
): E4GradientEvaluation {
    const normalizedInputs = createE4PersonalInputs(inputs);
    const normalizedState = freezeState(state);
    const evaluation = computeE4PersonalEnergy(normalizedState, normalizedInputs, options);
    const euclidean = vectorScale(
        vectorSubtract(evaluation.loraForward, normalizedInputs.pasuSnapshot.q_personal),
        1 / 2
    );
    const qPNormSquared = dot(normalizedState.q_p, normalizedState.q_p);
    const radial = qPNormSquared === 0 ? 0 : dot(euclidean, normalizedState.q_p) / qPNormSquared;
    const tangent = vectorSubtract(euclidean, vectorScale(normalizedState.q_p, radial));
    return Object.freeze({
        channel: 'E_4',
        gradient: tangent,
        norm: Math.sqrt(dot(tangent, tangent)),
        scalar: evaluation.scalar,
        provenance: evaluation.provenance
    });
}

function naraLoraForward(state: E4KernelCandidateState, inputs: E4PersonalInputs): readonly [number, number, number, number] {
    const kairosPhase = inputs.kairos.planet_degrees.map(degree => Math.sin((degree * Math.PI) / 180));
    const oraclePhase = [
        inputs.kairos.oracle_charges.pp,
        inputs.kairos.oracle_charges.mm,
        inputs.kairos.oracle_charges.mp,
        inputs.kairos.oracle_charges.pn
    ].map(charge => Math.tanh(charge / 64));
    const corpusPhase = stableUnitInterval([
        ...inputs.corpus.journal_hashes,
        ...inputs.corpus.dream_hashes,
        ...inputs.corpus.phone_writing_hashes,
        inputs.corpus.model_version_key,
        inputs.lora_checkpoint.version
    ]);
    const raw = state.q_p.map((component, index) => {
        const planet = kairosPhase[index] ?? 0;
        const oracle = oraclePhase[index] ?? 0;
        return component + 0.05 * planet + 0.05 * oracle + 0.01 * corpusPhase;
    }) as [number, number, number, number];
    return normalizeQuaternion(raw);
}

function kairosCoherencePenalty(kairos: E4KairosState): number {
    const planetMean =
        kairos.planet_degrees.reduce((sum, degree) => sum + Math.sin((degree * Math.PI) / 180), 0) /
        kairos.planet_degrees.length;
    const chargeTotal =
        Math.abs(kairos.oracle_charges.pp) +
        Math.abs(kairos.oracle_charges.mm) +
        Math.abs(kairos.oracle_charges.mp) +
        Math.abs(kairos.oracle_charges.pn);
    return Math.abs(planetMean) / 2 + Math.tanh(chargeTotal / 64) / 2;
}

function corpusAdapterPenalty(corpus: E4CorpusDigest): number {
    const corpusCount = corpus.journal_hashes.length + corpus.dream_hashes.length + corpus.phone_writing_hashes.length;
    return corpusCount === 0 ? 1 : 1 / (1 + corpusCount);
}

function freezeState(state: E4KernelCandidateState): E4KernelCandidateState {
    return Object.freeze({
        q_b: freezeQuaternion('q_b', state.q_b),
        q_p: freezeQuaternion('q_p', state.q_p),
        mathemeHarmonicProfile: Object.freeze({ ...(state.mathemeHarmonicProfile ?? {}) })
    });
}

function freezeLoraCheckpoint(checkpoint: E4LoraCheckpointRef): E4LoraCheckpointRef {
    if (checkpoint.privacy_class !== E4_LOCAL_ONLY_PRIVACY_CLASS) {
        throw new Error(
            `Nara LoRA checkpoint privacy_class must be local-only per [[M'-MODEL-SLOT-SPEC]]; received ${checkpoint.privacy_class}.`
        );
    }
    const path = requireNonEmpty('lora_checkpoint.path', checkpoint.path);
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path) && !path.startsWith('file://')) {
        throw new Error(
            `Nara LoRA checkpoint path must be local-only per [[M'-MODEL-SLOT-SPEC]]; refused non-local destination ${path}.`
        );
    }
    return Object.freeze({
        path,
        version: requireNonEmpty('lora_checkpoint.version', checkpoint.version),
        privacy_class: E4_LOCAL_ONLY_PRIVACY_CLASS
    });
}

function freezeOracleCharges(charges: E4OracleCharges): E4OracleCharges {
    return Object.freeze({
        pp: finiteScalar('oracle_charges.pp', charges.pp),
        mm: finiteScalar('oracle_charges.mm', charges.mm),
        mp: finiteScalar('oracle_charges.mp', charges.mp),
        pn: finiteScalar('oracle_charges.pn', charges.pn)
    });
}

function freezePlanetDegrees(value: readonly number[]): E4KairosState['planet_degrees'] {
    if (!Array.isArray(value) || value.length !== 10) {
        throw new Error('E4 kairos planet_degrees[10] must be canonical mod-10 Sun[0]-Pluto[9].');
    }
    return Object.freeze(value.map((degree, index) => {
        const finite = finiteScalar(`planet_degrees[${index}]`, degree);
        return ((finite % 360) + 360) % 360;
    }) as unknown as E4KairosState['planet_degrees']);
}

function freezeQuaternion(name: string, value: readonly number[]): readonly [number, number, number, number] {
    if (!Array.isArray(value) || value.length !== 4) {
        throw new Error(`${name}[4] must be a four-component quaternion.`);
    }
    return Object.freeze(value.map((component, index) => finiteScalar(`${name}[${index}]`, component)) as [
        number,
        number,
        number,
        number
    ]);
}

function freezeHashList(name: string, value: readonly string[]): readonly string[] {
    if (!Array.isArray(value)) {
        throw new Error(`${name} must be a list of local corpus content hashes.`);
    }
    return Object.freeze(value.map((entry, index) => requireNonEmpty(`${name}[${index}]`, entry)));
}

function provenanceFor(runtime: NaraLoraRuntime, inputs: E4PersonalInputs): E4EnergyProvenance {
    return Object.freeze({
        channel: 'E_4',
        runtime,
        privacyClass: E4_LOCAL_ONLY_PRIVACY_CLASS,
        checkpointVersion: inputs.lora_checkpoint.version,
        kairosWindowId: inputs.kairos.kairos_window_id,
        weightingCoefficient: 4,
        decision: E4_PERSONAL_SUBSTRATE_DECISION,
        modelSlotSpecRef: "[[M'-MODEL-SLOT-SPEC]]",
        mlSkillSurfaceRef: "[[M'-ML-SKILL-SURFACE-SPEC]] §3.1 + §3.2 + §7.1",
        mentalPoleMechanicsRef: "[[M4'/mental-pole-mechanics]] §7.5 ∇E_4",
        autogradPath: 'rust-native-nara-lora-forward'
    });
}

function squaredDistance(left: readonly number[], right: readonly number[]): number {
    return left.reduce((sum, component, index) => {
        const delta = component - (right[index] ?? 0);
        return sum + delta * delta;
    }, 0);
}

function normalizeQuaternion(value: readonly [number, number, number, number]): readonly [number, number, number, number] {
    const norm = Math.sqrt(dot(value, value));
    if (norm === 0) {
        throw new Error('Cannot normalize zero quaternion for E4 Nara-LoRA forward pass.');
    }
    return Object.freeze(value.map(component => component / norm) as [number, number, number, number]);
}

function vectorSubtract(
    left: readonly [number, number, number, number],
    right: readonly [number, number, number, number]
): readonly [number, number, number, number] {
    return Object.freeze(left.map((component, index) => component - right[index]) as [number, number, number, number]);
}

function vectorScale(
    value: readonly [number, number, number, number],
    scalar: number
): readonly [number, number, number, number] {
    return Object.freeze(value.map(component => component * scalar) as [number, number, number, number]);
}

function dot(left: readonly number[], right: readonly number[]): number {
    return left.reduce((sum, component, index) => sum + component * (right[index] ?? 0), 0);
}

function finiteScalar(name: string, value: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`${name} must be a finite number.`);
    }
    return value;
}

function requireNonEmpty(name: string, value: string): string {
    const normalized = requireString(name, value).trim();
    if (normalized.length === 0) {
        throw new Error(`${name} must be non-empty.`);
    }
    return normalized;
}

function requireString(name: string, value: string): string {
    if (typeof value !== 'string') {
        throw new Error(`${name} must be a string.`);
    }
    return value;
}

function stableUnitInterval(parts: readonly string[]): number {
    const text = parts.join('\n');
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 0xffffffff;
}

function globalProcessValue(key: 'platform' | 'arch'): string {
    const maybeProcess = globalThis as typeof globalThis & {
        readonly process?: { readonly platform?: string; readonly arch?: string };
    };
    return maybeProcess.process?.[key] ?? '';
}
