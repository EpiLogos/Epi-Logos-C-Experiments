import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

import {
	translateAxiomProseToOwlShacl,
	validateEpiOntologySource,
} from "../lib/axiom-translate.ts";

const epiGnosticOntology = Object.freeze({
	sourceId: "Body/S/S5/epi-gnostic/import_epi_ontology_with_n10s",
	importProcedure: "import_epi_ontology_with_n10s" as const,
	owlTurtle: `
@prefix epi: <https://epi-logos.local/ontology#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
epi:Anuttara a owl:Class .
`,
	shaclTurtle: `
@prefix epi: <https://epi-logos.local/ontology#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
epi:AnuttaraShape a sh:NodeShape ; sh:targetClass epi:Anuttara .
`,
});

describe("12.T12.7 - Pi axiom-translation tooling", () => {
	it("validates epi-gnostic OWL/SHACL source evidence before translating", () => {
		const consumed = validateEpiOntologySource(epiGnosticOntology);

		assert.equal(consumed.sourceId, epiGnosticOntology.sourceId);
		assert.equal(consumed.importProcedure, "import_epi_ontology_with_n10s");
		assert.ok(consumed.owlSignals.includes("owl:"));
		assert.ok(consumed.shaclSignals.includes("sh:"));
	});

	it("bridges plain prose to concrete OWL and SHACL Turtle with review provenance", () => {
		const result = translateAxiomProseToOwlShacl({
			source: epiGnosticOntology,
			prose: [
				"AnuttaraInsight is an OWL class.",
				"AnuttaraInsight must have source anchor.",
				"AnuttaraInsight requires SHACL severity.",
				"AnuttaraInsight relates to Logos Atelier scent-following root.",
			].join(" "),
		});

		assert.equal(result.consumedOntology.importProcedure, "import_epi_ontology_with_n10s");
		assert.equal(result.diagnostics.length, 0);
		assert.ok(result.axioms.every((axiom) => axiom.reviewRequired));
		assert.ok(result.axioms.some((axiom) => axiom.kind === "required_property"));
		assert.ok(result.axioms.some((axiom) => axiom.kind === "object_relation"));

		assert.match(result.owlTurtle, /epi:AnuttaraInsight a owl:Class/);
		assert.match(result.owlTurtle, /epi:LogosAtelierScentFollowingRoot a owl:Class/);
		assert.match(result.owlTurtle, /epi:hasSourceAnchor a owl:ObjectProperty/);
		assert.match(result.owlTurtle, /rdfs:range epi:ShaclSeverity/);
		assert.match(result.owlTurtle, /source=Body\/S\/S5\/epi-gnostic\/import_epi_ontology_with_n10s/);

		assert.match(result.shaclTurtle, /epi:AnuttaraInsightShape a sh:NodeShape/);
		assert.match(result.shaclTurtle, /sh:targetClass epi:AnuttaraInsight/);
		assert.match(result.shaclTurtle, /sh:path epi:hasSourceAnchor/);
		assert.match(result.shaclTurtle, /sh:minCount 1/);
		assert.match(result.shaclTurtle, /sh:severity sh:Violation/);
		assert.match(result.shaclTurtle, /sh:path epi:relatesTo/);
	});
});

