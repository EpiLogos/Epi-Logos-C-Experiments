import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";

import {
	enumerateSkillUniverse,
	type AgentEffectiveEntitlement,
} from "../../../lib/entitlement.ts";

export type EntitlementClass =
	| "allowed-for-current-agent"
	| "requires-elevation"
	| "forbidden";

export type SkillManifestEntryKind = "skill" | "aeon";

export interface SkillManifestEntry {
	kind: SkillManifestEntryKind;
	name: string;
	description: string;
	when_to_use: string;
	vak_coordinate: string;
	quintessential_form: string;
	bimba_coordinate: string;
	entitlement_class: EntitlementClass;
	path?: string;
	score?: number;
}

export interface SkillLookupConfig {
	max_results_default: number;
	semantic_similarity_score_cutoff: number;
	cache_ttl_ms: number;
	fallback_trigger_threshold: number;
	local_embedding_model: string;
	embedding_dimensions: number;
}

export interface SkillLookupServiceOptions {
	repoRoot?: string;
	homeDir?: string;
	skillUniverseRoots: string[];
	effective: AgentEffectiveEntitlement;
	config: SkillLookupConfig;
	nowMs?: number;
	readText?: (path: string) => Promise<string>;
}

interface IndexedSkillEntry extends SkillManifestEntry {
	search_text: string;
	embedding: number[];
}

interface SkillLookupContext {
	service: SkillLookupService;
}

let activeContext: SkillLookupContext | null = null;

export function configureSkillLookupContext(service: SkillLookupService | null): void {
	activeContext = service ? { service } : null;
}

export async function skill_lookup(
	query: string,
	max_results?: number,
): Promise<SkillManifestEntry[]> {
	if (!activeContext) {
		throw new Error("skill_lookup unavailable: no active skill lookup context");
	}
	return activeContext.service.lookup(query, max_results);
}

export async function createSkillLookupService(
	options: SkillLookupServiceOptions,
): Promise<SkillLookupService> {
	const manifest = await enumerateSkillManifestEntries({
		repoRoot: options.repoRoot,
		skillUniverseRoots: options.skillUniverseRoots,
		effective: options.effective,
		readText: options.readText,
	});
	if (manifest.length < options.config.fallback_trigger_threshold) {
		throw new Error(
			`skill_lookup unavailable: manifest entries ${manifest.length} below configured fallback_trigger_threshold`,
		);
	}

	const manifestHash = hashManifest(manifest, options.config);
	const cachePath = skillManifestEmbeddingCachePath(
		options.homeDir ?? process.env.HOME,
		manifestHash,
	);
	const indexed = loadEmbeddingCache(cachePath, options.config, options.nowMs) ??
		indexManifest(manifest, options.config);
	writeEmbeddingCache(cachePath, indexed);
	return new SkillLookupService(indexed, options.config);
}

export class SkillLookupService {
	private readonly entries: IndexedSkillEntry[];
	private readonly config: SkillLookupConfig;

	constructor(
		entries: IndexedSkillEntry[],
		config: SkillLookupConfig,
	) {
		this.entries = entries;
		this.config = config;
	}

	lookup(query: string, max_results?: number): SkillManifestEntry[] {
		if (typeof query !== "string" || query.trim().length === 0) return [];
		const limit = max_results ?? this.config.max_results_default;
		const queryEmbedding = embedText(query, this.config.embedding_dimensions);
		return this.entries
			.map((entry) => ({
				...entry,
				score: cosineSimilarity(queryEmbedding, entry.embedding),
			}))
			.filter((entry) => entry.score >= this.config.semantic_similarity_score_cutoff)
			.sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.name.localeCompare(b.name))
			.slice(0, limit)
			.map(({ search_text, embedding, ...entry }) => entry);
	}
}

export async function loadSkillLookupConfig(input: {
	path?: string;
	homeDir?: string;
	readText?: (path: string) => Promise<string>;
} = {}): Promise<SkillLookupConfig> {
	const path = input.path ?? join(input.homeDir ?? process.env.HOME ?? "~", ".epi-logos", "config.toml");
	const readText = input.readText ?? ((target: string) => readFile(target, "utf8"));
	return parseSkillLookupConfigToml(await readText(path));
}

export function parseSkillLookupConfigToml(text: string): SkillLookupConfig {
	const section = parseTomlSection(text, "pi.skill_lookup");
	return {
		max_results_default: requiredInteger(section, "max_results_default"),
		semantic_similarity_score_cutoff: requiredNumber(section, "semantic_similarity_score_cutoff"),
		cache_ttl_ms: requiredInteger(section, "cache_ttl_ms"),
		fallback_trigger_threshold: requiredInteger(section, "fallback_trigger_threshold"),
		local_embedding_model: requiredString(section, "local_embedding_model"),
		embedding_dimensions: requiredInteger(section, "embedding_dimensions"),
	};
}

export function skillManifestEmbeddingCachePath(
	homeDir: string | undefined,
	manifestHash: string,
): string {
	if (!homeDir || homeDir.trim().length === 0 || homeDir === "~") {
		throw new Error("HOME is required to locate skill-manifest-embeddings cache");
	}
	return join(
		homeDir,
		".epi-logos",
		"cache",
		"skill-manifest-embeddings",
		`${manifestHash}.bin`,
	);
}

export async function enumerateSkillManifestEntries(input: {
	repoRoot?: string;
	skillUniverseRoots: string[];
	effective: AgentEffectiveEntitlement;
	readText?: (path: string) => Promise<string>;
}): Promise<SkillManifestEntry[]> {
	const roots = resolveSkillRoots(input.skillUniverseRoots, input.repoRoot);
	const universe = enumerateSkillUniverse(roots);
	const readText = input.readText ?? ((target: string) => readFile(target, "utf8"));
	const out: SkillManifestEntry[] = [];
	for (const name of universe) {
		const skillPath = findSkillPath(roots, name);
		if (!skillPath) continue;
		const raw = await readText(skillPath);
		const parsed = parseSkillMarkdown(raw);
		const entitlement_class = classifyEntitlement(name, input.effective);
		if (entitlement_class !== "allowed-for-current-agent") continue;
		out.push({
			kind: parsed.kind,
			name: parsed.name || name,
			description: parsed.description,
			when_to_use: parsed.when_to_use,
			vak_coordinate: parsed.vak_coordinate,
			quintessential_form: parsed.quintessential_form,
			bimba_coordinate: parsed.bimba_coordinate,
			entitlement_class,
			path: skillPath,
		});
	}
	return out;
}

function resolveSkillRoots(roots: string[], repoRoot: string | undefined): string[] {
	return (Array.isArray(roots) ? roots : [])
		.filter((root) => typeof root === "string" && root.trim().length > 0)
		.map((root) => {
			const trimmed = root.trim();
			return isAbsolute(trimmed) ? trimmed : repoRoot ? resolve(repoRoot, trimmed) : trimmed;
		});
}

function findSkillPath(roots: string[], name: string): string | undefined {
	for (const root of roots) {
		const candidate = join(root, name, "SKILL.md");
		if (existsSync(candidate)) return candidate;
	}
	return undefined;
}

function classifyEntitlement(
	name: string,
	effective: AgentEffectiveEntitlement,
): EntitlementClass {
	if (effective.skills.effective.includes(name)) return "allowed-for-current-agent";
	if (effective.skills.teamCeiling.includes(name) || effective.skills.agentScope.includes(name)) {
		return "requires-elevation";
	}
	return "forbidden";
}

function parseSkillMarkdown(raw: string): {
	kind: SkillManifestEntryKind;
	name: string;
	description: string;
	when_to_use: string;
	vak_coordinate: string;
	quintessential_form: string;
	bimba_coordinate: string;
} {
	const { frontmatter, body } = splitFrontmatter(raw);
	const title = body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "";
	const description = frontmatter.description ?? firstParagraph(body);
	const when_to_use =
		frontmatter.when_to_use ??
		findWhenToUse(body) ??
		description;
	const inferredVakCoordinate =
		[
			frontmatter.cpf ? `CPF:${frontmatter.cpf}` : "",
			frontmatter.ct ? `CT:${frontmatter.ct}` : "",
			frontmatter.cp ? `CP:${frontmatter.cp}` : "",
			frontmatter.cf ? `CF:${frontmatter.cf}` : "",
			frontmatter.cfp ? `CFP:${frontmatter.cfp}` : "",
			frontmatter.cs ? `CS:${frontmatter.cs}` : "",
		].filter(Boolean).join(";");
	const vak_coordinate = frontmatter.vak_coordinate ?? inferredVakCoordinate;
	return {
		kind: parseManifestEntryKind(frontmatter.kind ?? frontmatter.entry_kind ?? frontmatter.manifest_kind),
		name: frontmatter.name ?? title,
		description,
		when_to_use,
		vak_coordinate,
		quintessential_form: frontmatter.quintessential_form ?? "",
		bimba_coordinate: frontmatter.bimba_coordinate ?? "",
	};
}

function parseManifestEntryKind(value: string | undefined): SkillManifestEntryKind {
	return value?.trim().toLowerCase() === "aeon" ? "aeon" : "skill";
}

function splitFrontmatter(raw: string): { frontmatter: Record<string, string>; body: string } {
	if (!raw.startsWith("---\n")) return { frontmatter: {}, body: raw };
	const end = raw.indexOf("\n---", 4);
	if (end < 0) return { frontmatter: {}, body: raw };
	const fm = raw.slice(4, end);
	const body = raw.slice(end + 4).replace(/^\n/, "");
	return { frontmatter: parseFlatFrontmatter(fm), body };
}

function parseFlatFrontmatter(text: string): Record<string, string> {
	const out: Record<string, string> = {};
	for (const line of text.split(/\r?\n/)) {
		const match = line.match(/^([A-Za-z0-9_.-]+):\s*(.*)$/);
		if (!match) continue;
		out[match[1]] = stripQuotes(match[2].trim());
	}
	return out;
}

function findWhenToUse(body: string): string | undefined {
	const match = body.match(/\bUse (?:this skill|when|whenever)[^\n.]*(?:\.[^\n.]*)?/i);
	return match?.[0]?.trim();
}

function firstParagraph(body: string): string {
	return body
		.split(/\n\s*\n/)
		.map((part) => part.replace(/^#+\s+/gm, "").trim())
		.find((part) => part.length > 0) ?? "";
}

function stripQuotes(value: string): string {
	if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
		return value.slice(1, -1);
	}
	return value;
}

function indexManifest(
	manifest: SkillManifestEntry[],
	config: SkillLookupConfig,
): IndexedSkillEntry[] {
	return manifest.map((entry) => {
		const search_text = [
			entry.kind,
			entry.name,
			entry.description,
			entry.when_to_use,
			entry.vak_coordinate,
			entry.quintessential_form,
			entry.bimba_coordinate,
		].filter(Boolean).join("\n");
		return {
			...entry,
			search_text,
			embedding: embedText(search_text, config.embedding_dimensions),
		};
	});
}

function embedText(text: string, dimensions: number): number[] {
	if (!Number.isInteger(dimensions) || dimensions <= 0) {
		throw new Error("embedding_dimensions must be a positive integer");
	}
	const vector = Array.from({ length: dimensions }, () => 0);
	for (const token of tokenize(text)) {
		const digest = createHash("sha256").update(token).digest();
		const index = digest.readUInt32BE(0) % dimensions;
		const sign = digest[4] % 2 === 0 ? 1 : -1;
		vector[index] += sign;
	}
	normalizeInPlace(vector);
	return vector;
}

function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[_/-]+/g, " ")
		.match(/[a-z0-9']+/g) ?? [];
}

function normalizeInPlace(vector: number[]): void {
	const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
	if (norm === 0) return;
	for (let i = 0; i < vector.length; i++) vector[i] = vector[i] / norm;
}

function cosineSimilarity(a: number[], b: number[]): number {
	let dot = 0;
	const len = Math.min(a.length, b.length);
	for (let i = 0; i < len; i++) dot += a[i] * b[i];
	return dot;
}

function hashManifest(manifest: SkillManifestEntry[], config: SkillLookupConfig): string {
	return createHash("sha256")
		.update(JSON.stringify({
			manifest,
			local_embedding_model: config.local_embedding_model,
			embedding_dimensions: config.embedding_dimensions,
		}))
		.digest("hex");
}

function loadEmbeddingCache(
	path: string,
	config: SkillLookupConfig,
	nowMs: number | undefined,
): IndexedSkillEntry[] | null {
	try {
		if (!existsSync(path)) return null;
		const age = (nowMs ?? Date.now()) - statSync(path).mtimeMs;
		if (age > config.cache_ttl_ms) return null;
		const raw = JSON.parse(readFileSync(path, "utf8"));
		if (!Array.isArray(raw?.entries)) return null;
		return raw.entries;
	} catch {
		return null;
	}
}

function writeEmbeddingCache(path: string, entries: IndexedSkillEntry[]): void {
	try {
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(path, JSON.stringify({ entries }), "utf8");
	} catch {
		/* cache failure must not break lookup */
	}
}

function parseTomlSection(text: string, sectionName: string): Record<string, string> {
	let active = false;
	const out: Record<string, string> = {};
	for (const rawLine of text.split(/\r?\n/)) {
		const line = rawLine.replace(/#.*/, "").trim();
		if (line.length === 0) continue;
		const sectionMatch = line.match(/^\[([^\]]+)\]$/);
		if (sectionMatch) {
			active = sectionMatch[1] === sectionName;
			continue;
		}
		if (!active) continue;
		const kv = line.match(/^([A-Za-z0-9_.-]+)\s*=\s*(.+)$/);
		if (kv) out[kv[1]] = stripQuotes(kv[2].trim());
	}
	if (Object.keys(out).length === 0) {
		throw new Error(`Missing [${sectionName}] config section`);
	}
	return out;
}

function requiredNumber(section: Record<string, string>, key: string): number {
	const raw = section[key];
	if (raw === undefined) throw new Error(`Missing [pi.skill_lookup].${key}`);
	const value = Number(raw);
	if (!Number.isFinite(value)) throw new Error(`[pi.skill_lookup].${key} must be a number`);
	return value;
}

function requiredInteger(section: Record<string, string>, key: string): number {
	const value = requiredNumber(section, key);
	if (!Number.isInteger(value)) throw new Error(`[pi.skill_lookup].${key} must be an integer`);
	return value;
}

function requiredString(section: Record<string, string>, key: string): string {
	const value = section[key];
	if (value === undefined || value.trim().length === 0) {
		throw new Error(`Missing [pi.skill_lookup].${key}`);
	}
	return value;
}
