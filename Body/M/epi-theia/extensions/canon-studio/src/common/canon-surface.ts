export const EXTENSION_ID = 'canon-studio' as const;
export const CANON_STUDIO_WIDGET_ID = 'pratibimba.canon-studio.markdownEditor' as const;
export const CANON_STUDIO_OPEN_COMMAND_ID = 'pratibimba.canon-studio.open' as const;
export const CANON_STUDIO_SAVE_COMMAND_ID = 'pratibimba.canon-studio.save' as const;

export const S1_SEMANTIC_AUTOCOMPLETE_METHOD = "s1'.semantic.autocomplete" as const;
export const S1_SEMANTIC_CONTEXT_METHOD = "s1'.semantic.context" as const;
export const S1_VAULT_READ_METHOD = "s1'.vault.readMarkdown" as const;
export const S1_VAULT_WRITE_METHOD = "s1'.vault.writeMarkdown" as const;

export type CanonDecorationKind = 'ql-coordinate' | 'bimba-coordinate' | 'wikilink';

export interface CanonDecoration {
    readonly kind: CanonDecorationKind;
    readonly line: number;
    readonly startColumn: number;
    readonly endColumn: number;
    readonly value: string;
}

export interface CanonAutocompleteRequest {
    readonly gatewayMethod: typeof S1_SEMANTIC_AUTOCOMPLETE_METHOD;
    readonly documentUri: string;
    readonly prefix: string;
    readonly cursorLine: number;
    readonly cursorColumn: number;
    readonly semanticScopes: readonly ['ql', 'bimba', 'wikilink'];
}

export interface CanonAutocompleteItem {
    readonly label: string;
    readonly insertText: string;
    readonly detail: string;
    readonly provenanceHandle: string;
}

export interface CanonVaultWriteRequest {
    readonly gatewayMethod: typeof S1_VAULT_WRITE_METHOD;
    readonly documentUri: string;
    readonly markdown: string;
    readonly provenanceHandles: readonly string[];
}

const QL_COORDINATE = /\b(?:QL|CP|CT|CF|CPF|CFP|CS)[-:# ]?[0-5](?:[.'/][0-5])*\b/g;
const BIMBA_COORDINATE = /#[0-5](?:\.[0-5])*(?:'|p)?\b/g;
const WIKILINK = /\[\[([^\]\n]+)\]\]/g;

export function scanCanonDecorations(markdown: string): readonly CanonDecoration[] {
    const decorations: CanonDecoration[] = [];
    const lines = markdown.split('\n');
    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        pushMatches(decorations, 'ql-coordinate', index + 1, line, QL_COORDINATE);
        pushMatches(decorations, 'bimba-coordinate', index + 1, line, BIMBA_COORDINATE);
        pushMatches(decorations, 'wikilink', index + 1, line, WIKILINK);
    }
    return Object.freeze(decorations);
}

export function buildSemanticAutocompleteRequest(
    documentUri: string,
    prefix: string,
    cursorLine: number,
    cursorColumn: number
): CanonAutocompleteRequest {
    return Object.freeze({
        gatewayMethod: S1_SEMANTIC_AUTOCOMPLETE_METHOD,
        documentUri,
        prefix,
        cursorLine,
        cursorColumn,
        semanticScopes: Object.freeze(['ql', 'bimba', 'wikilink'] as const)
    });
}

export function buildVaultWriteRequest(
    documentUri: string,
    markdown: string,
    provenanceHandles: readonly string[]
): CanonVaultWriteRequest {
    return Object.freeze({
        gatewayMethod: S1_VAULT_WRITE_METHOD,
        documentUri,
        markdown,
        provenanceHandles: Object.freeze([...provenanceHandles])
    });
}

function pushMatches(
    out: CanonDecoration[],
    kind: CanonDecorationKind,
    lineNumber: number,
    line: string,
    pattern: RegExp
): void {
    pattern.lastIndex = 0;
    let match = pattern.exec(line);
    while (match !== null) {
        out.push({
            kind,
            line: lineNumber,
            startColumn: match.index + 1,
            endColumn: match.index + match[0].length + 1,
            value: match[0]
        });
        match = pattern.exec(line);
    }
}
