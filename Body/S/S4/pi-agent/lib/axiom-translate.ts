/**
 * axiom-translate.ts - Pi axiom-translation tooling (12.T12.7 / DR-B-2).
 *
 * Coordinate: [[S4]] / [[S4']] Pi runtime surface
 * Residency: Body/S/S4/pi-agent/lib/axiom-translate.ts
 * Position (#n): #4 agent-runtime bridge preparing #5 review evidence
 * Actualises: DR-B-2 Pi tool-surface bridge from plain prose to OWL/SHACL
 * Public surface: translateAxiomProseToOwlShacl(), validateEpiOntologySource()
 * Does NOT own: ontology canon mutation, SHACL execution, n10s import, Epii review resolution
 * Contract: consumes epi-gnostic OWL/SHACL source evidence and emits reviewable Turtle patches only
 */

export interface EpiOntologySource {
	readonly sourceId: string;
	readonly importProcedure?: "import_epi_ontology_with_n10s" | (string & {});
	readonly owlTurtle?: string;
	readonly shaclTurtle?: string;
	readonly prefixes?: Record<string, string>;
}

export interface AxiomTranslationInput {
	readonly prose: string;
	readonly source: EpiOntologySource;
	readonly defaultSubject?: string;
	readonly baseIri?: string;
}

export type AxiomKind = "class" | "required_property" | "object_relation";

export interface TranslatedAxiom {
	readonly kind: AxiomKind;
	readonly subject: string;
	readonly predicate?: string;
	readonly object?: string;
	readonly sourceSentence: string;
	readonly reviewRequired: boolean;
}

export interface OntologySourceConsumption {
	readonly sourceId: string;
	readonly importProcedure?: string;
	readonly owlSignals: readonly string[];
	readonly shaclSignals: readonly string[];
}

export interface AxiomTranslationResult {
	readonly consumedOntology: OntologySourceConsumption;
	readonly axioms: readonly TranslatedAxiom[];
	readonly owlTurtle: string;
	readonly shaclTurtle: string;
	readonly diagnostics: readonly string[];
}

const DEFAULT_BASE_IRI = "https://epi-logos.local/ontology#";

const DEFAULT_PREFIXES: Record<string, string> = Object.freeze({
	epi: DEFAULT_BASE_IRI,
	owl: "http://www.w3.org/2002/07/owl#",
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	rdfs: "http://www.w3.org/2000/01/rdf-schema#",
	sh: "http://www.w3.org/ns/shacl#",
	xsd: "http://www.w3.org/2001/XMLSchema#",
});

const KNOWN_SUBJECT_ALIASES: ReadonlyArray<readonly [RegExp, string]> = Object.freeze([
	[/\banuttara\b/i, "Anuttara"],
	[/\blogos atelier\b/i, "LogosAtelier"],
	[/\bscent[- ]following root\b/i, "LogosAtelierScentRoot"],
	[/\bpi\b/i, "Pi"],
	[/\bepii\b/i, "Epii"],
]);

export function validateEpiOntologySource(
	source: EpiOntologySource,
): OntologySourceConsumption {
	const sourceId = source.sourceId?.trim();
	if (!sourceId) {
		throw new Error("axiom translation requires source.sourceId");
	}

	const owlSignals = collectOntologySignals(source.owlTurtle ?? "", [
		"owl:",
		"owl#",
		"rdf:type owl:Class",
		"a owl:Class",
	]);
	const shaclSignals = collectOntologySignals(source.shaclTurtle ?? "", [
		"sh:",
		"shacl",
		"sh:NodeShape",
		"sh:property",
	]);
	const hasN10sImport = source.importProcedure === "import_epi_ontology_with_n10s";

	if (owlSignals.length === 0 && !hasN10sImport) {
		throw new Error(
			"axiom translation requires epi-gnostic OWL evidence or import_epi_ontology_with_n10s provenance",
		);
	}
	if (shaclSignals.length === 0 && !hasN10sImport) {
		throw new Error(
			"axiom translation requires epi-gnostic SHACL evidence or import_epi_ontology_with_n10s provenance",
		);
	}

	return Object.freeze({
		sourceId,
		importProcedure: source.importProcedure,
		owlSignals,
		shaclSignals,
	});
}

export function translateAxiomProseToOwlShacl(
	input: AxiomTranslationInput,
): AxiomTranslationResult {
	const consumedOntology = validateEpiOntologySource(input.source);
	const diagnostics: string[] = [];
	const axioms = parseAxioms(input.prose, input.defaultSubject, diagnostics);
	if (axioms.length === 0) {
		throw new Error("no translatable axiom statements found in prose");
	}

	const prefixes = {
		...DEFAULT_PREFIXES,
		epi: input.baseIri ?? input.source.prefixes?.epi ?? DEFAULT_PREFIXES.epi,
		...(input.source.prefixes ?? {}),
	};

	return Object.freeze({
		consumedOntology,
		axioms,
		owlTurtle: renderOwlTurtle(axioms, prefixes, consumedOntology),
		shaclTurtle: renderShaclTurtle(axioms, prefixes, consumedOntology),
		diagnostics,
	});
}

function parseAxioms(
	prose: string,
	defaultSubject: string | undefined,
	diagnostics: string[],
): TranslatedAxiom[] {
	const sentences = splitSentences(prose);
	const axioms: TranslatedAxiom[] = [];
	let activeSubject = defaultSubject ? toPascalName(defaultSubject) : "";

	for (const sentence of sentences) {
		const classMatch = sentence.match(/^(.+?)\s+is\s+(?:an?\s+)?(?:owl\s+)?class$/i);
		if (classMatch) {
			const subject = subjectFromPhrase(classMatch[1], activeSubject);
			activeSubject = subject;
			axioms.push(freezeAxiom({ kind: "class", subject, sourceSentence: sentence }));
			continue;
		}

		const requiredMatch = sentence.match(
			/^(.+?)\s+(?:must\s+have|requires?|shall\s+have)\s+(.+)$/i,
		);
		if (requiredMatch) {
			const subject = subjectFromPhrase(requiredMatch[1], activeSubject);
			const object = toPascalName(stripArticle(requiredMatch[2]));
			activeSubject = subject;
			axioms.push(freezeAxiom({
				kind: "required_property",
				subject,
				predicate: `has${object}`,
				object,
				sourceSentence: sentence,
			}));
			ensureClassAxiom(axioms, subject, sentence);
			continue;
		}

		const relationMatch = sentence.match(
			/^(.+?)\s+(?:relates\s+to|references|points\s+to|links\s+to)\s+(.+)$/i,
		);
		if (relationMatch) {
			const subject = subjectFromPhrase(relationMatch[1], activeSubject);
			const object = toPascalName(stripArticle(relationMatch[2]));
			activeSubject = subject;
			axioms.push(freezeAxiom({
				kind: "object_relation",
				subject,
				predicate: "relatesTo",
				object,
				sourceSentence: sentence,
			}));
			ensureClassAxiom(axioms, subject, sentence);
			ensureClassAxiom(axioms, object, sentence);
			continue;
		}

		diagnostics.push(`ignored sentence: ${sentence}`);
	}

	return axioms;
}

function renderOwlTurtle(
	axioms: readonly TranslatedAxiom[],
	prefixes: Record<string, string>,
	source: OntologySourceConsumption,
): string {
	const lines = [
		...renderPrefixes(prefixes),
		"",
		`# Pi axiom-translate output; source=${source.sourceId}; import=${source.importProcedure ?? "inline-owl-shacl"}`,
	];
	const classes = unique(axioms.flatMap((axiom) => {
		if (axiom.kind === "class") return [axiom.subject];
		if (axiom.object && axiom.kind === "object_relation") return [axiom.subject, axiom.object];
		return [axiom.subject];
	}));
	for (const name of classes) {
		lines.push(`epi:${name} a owl:Class ;`);
		lines.push(`  rdfs:label "${labelFromName(name)}" .`);
		lines.push("");
	}

	const properties = unique(
		axioms
			.filter((axiom) => axiom.predicate && axiom.object)
			.map((axiom) => `${axiom.subject}|${axiom.predicate}|${axiom.object}`),
	);
	for (const property of properties) {
		const [subject, predicate, object] = property.split("|");
		lines.push(`epi:${predicate} a owl:ObjectProperty ;`);
		lines.push(`  rdfs:domain epi:${subject} ;`);
		lines.push(`  rdfs:range epi:${object} ;`);
		lines.push(`  rdfs:label "${labelFromName(predicate)}" .`);
		lines.push("");
	}
	return `${lines.join("\n").trim()}\n`;
}

function renderShaclTurtle(
	axioms: readonly TranslatedAxiom[],
	prefixes: Record<string, string>,
	source: OntologySourceConsumption,
): string {
	const lines = [
		...renderPrefixes(prefixes),
		"",
		`# Pi axiom-translate SHACL output; source=${source.sourceId}; import=${source.importProcedure ?? "inline-owl-shacl"}`,
	];
	const bySubject = new Map<string, TranslatedAxiom[]>();
	for (const axiom of axioms) {
		if (!axiom.predicate || !axiom.object) continue;
		const bucket = bySubject.get(axiom.subject) ?? [];
		bucket.push(axiom);
		bySubject.set(axiom.subject, bucket);
	}

	for (const [subject, subjectAxioms] of bySubject) {
		lines.push(`epi:${subject}Shape a sh:NodeShape ;`);
		lines.push(`  sh:targetClass epi:${subject} ;`);
		subjectAxioms.forEach((axiom, index) => {
			const terminal = index === subjectAxioms.length - 1 ? "." : ";";
			lines.push("  sh:property [");
			lines.push(`    sh:path epi:${axiom.predicate} ;`);
			lines.push(`    sh:class epi:${axiom.object} ;`);
			if (axiom.kind === "required_property") {
				lines.push("    sh:minCount 1 ;");
				lines.push("    sh:severity sh:Violation ;");
			} else {
				lines.push("    sh:severity sh:Info ;");
			}
			lines.push(`    sh:message "${escapeLiteral(axiom.sourceSentence)}"`);
			lines.push(`  ] ${terminal}`);
		});
		lines.push("");
	}

	return `${lines.join("\n").trim()}\n`;
}

function renderPrefixes(prefixes: Record<string, string>): string[] {
	return Object.entries(prefixes)
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([prefix, iri]) => `@prefix ${prefix}: <${iri}> .`);
}

function splitSentences(prose: string): string[] {
	return prose
		.split(/[.;\n]+/)
		.map((sentence) => sentence.trim())
		.filter(Boolean);
}

function collectOntologySignals(text: string, needles: readonly string[]): string[] {
	const lower = text.toLowerCase();
	return needles.filter((needle) => lower.includes(needle.toLowerCase()));
}

function subjectFromPhrase(phrase: string, activeSubject: string): string {
	const cleaned = stripArticle(phrase);
	if (/^(it|this|that|the axiom|the class)$/i.test(cleaned) && activeSubject) {
		return activeSubject;
	}
	for (const [pattern, name] of KNOWN_SUBJECT_ALIASES) {
		if (pattern.test(cleaned)) return name;
	}
	return toPascalName(cleaned);
}

function stripArticle(value: string): string {
	return value
		.trim()
		.replace(/^(?:a|an|the)\s+/i, "")
		.replace(/\s+axiom$/i, "")
		.replace(/\s+field$/i, "")
		.trim();
}

function toPascalName(value: string): string {
	const words = value
		.trim()
		.replace(/['"`]/g, "")
		.replace(/[#:/]+/g, " ")
		.split(/[^A-Za-z0-9]+/)
		.filter(Boolean);
	if (words.length === 0) return "UnnamedAxiom";
	return words.map(normalizePascalWord).join("");
}

function normalizePascalWord(word: string): string {
	if (/^[A-Z0-9]+$/.test(word)) {
		const lower = word.toLowerCase();
		return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
	}
	return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

function labelFromName(name: string): string {
	return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
}

function escapeLiteral(value: string): string {
	return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function unique(values: readonly string[]): string[] {
	return [...new Set(values)].filter(Boolean).sort((a, b) => a.localeCompare(b));
}

function ensureClassAxiom(
	axioms: TranslatedAxiom[],
	subject: string,
	sourceSentence: string,
): void {
	if (axioms.some((axiom) => axiom.kind === "class" && axiom.subject === subject)) {
		return;
	}
	axioms.unshift(freezeAxiom({ kind: "class", subject, sourceSentence }));
}

function freezeAxiom(input: Omit<TranslatedAxiom, "reviewRequired">): TranslatedAxiom {
	return Object.freeze({ ...input, reviewRequired: true });
}
