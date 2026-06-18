#define M0_ANUTTARA_LINT_NO_MAIN
#include "../src/m0_anuttara_lint.c"

#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

static void write_file(const char* path, const char* body) {
    FILE* f = fopen(path, "w");
    assert(f != NULL);
    assert(fputs(body, f) >= 0);
    assert(fclose(f) == 0);
}

static char* read_file(const char* path) {
    FILE* f = fopen(path, "rb");
    assert(f != NULL);
    assert(fseek(f, 0, SEEK_END) == 0);
    const long len = ftell(f);
    assert(len >= 0);
    assert(fseek(f, 0, SEEK_SET) == 0);
    char* buf = (char*)calloc((size_t)len + 1u, 1u);
    assert(buf != NULL);
    assert(fread(buf, 1u, (size_t)len, f) == (size_t)len);
    assert(fclose(f) == 0);
    return buf;
}

static const M0LintCandidate* find_literal(
    const M0LintCandidateSet* set,
    const char* literal
) {
    for (size_t i = 0; i < set->count; i++) {
        if (strcmp(set->items[i].literal, literal) == 0) {
            return &set->items[i];
        }
    }
    return NULL;
}

static void test_scanner_classifies_real_numeric_literals(void) {
    char path[] = "/tmp/m0-anuttara-lint-fixture-XXXXXX.c";
    const int fd = mkstemps(path, 2);
    assert(fd >= 0);
    assert(close(fd) == 0);

    write_file(
        path,
        "static const int RELATION_TIMEOUT_MS = 2500;\n"
        "int default_retry_count = 3;\n"
        "if (score > 42) { return 7; }\n"
        "_Static_assert(sizeof(Header) == 128, \"layout\");\n"
        "#define M0_RING_SIZE 12\n"
        "// const int ignored_comment = 999;\n"
    );

    M0LintCandidateSet set;
    m0_lint_candidate_set_init(&set);
    assert(m0_lint_scan_file(path, &set) == 0);

    const M0LintCandidate* timeout = find_literal(&set, "2500");
    assert(timeout != NULL);
    assert(timeout->line == 1u);
    assert(timeout->classification == M0_LINT_GENUINELY_TUNABLE);
    assert(strstr(timeout->reason, "timeout") != NULL);

    const M0LintCandidate* retry = find_literal(&set, "3");
    assert(retry != NULL);
    assert(retry->line == 2u);
    assert(retry->classification == M0_LINT_GENUINELY_TUNABLE);
    assert(strstr(retry->reason, "default") != NULL);

    const M0LintCandidate* threshold = find_literal(&set, "42");
    assert(threshold != NULL);
    assert(threshold->line == 3u);
    assert(threshold->classification == M0_LINT_REVIEW_REQUIRED);

    const M0LintCandidate* layout = find_literal(&set, "128");
    assert(layout != NULL);
    assert(layout->line == 4u);
    assert(layout->classification == M0_LINT_STRUCTURAL_INVARIANT);

    assert(find_literal(&set, "999") == NULL);

    m0_lint_candidate_set_free(&set);
    assert(unlink(path) == 0);
}

static void test_report_emits_markdown_with_file_line_citations(void) {
    char source_path[] = "/tmp/m0-anuttara-lint-report-source-XXXXXX.c";
    char report_path[] = "/tmp/m0-anuttara-lint-report-XXXXXX.md";
    int fd = mkstemps(source_path, 2);
    assert(fd >= 0);
    assert(close(fd) == 0);
    fd = mkstemps(report_path, 3);
    assert(fd >= 0);
    assert(close(fd) == 0);

    write_file(
        source_path,
        "static const int GATEWAY_TIMEOUT_MS = 1500;\n"
        "_Static_assert(sizeof(void*) == 8, \"pointer width\");\n"
    );

    M0LintCandidateSet set;
    m0_lint_candidate_set_init(&set);
    assert(m0_lint_scan_file(source_path, &set) == 0);
    assert(m0_lint_write_markdown_report(report_path, &set) == 0);

    char* report = read_file(report_path);
    assert(strstr(report, "# M0 Anuttara Tunable Audit Report") != NULL);
    assert(strstr(report, "## Genuinely Tunable Candidates") != NULL);
    assert(strstr(report, "## Structural Invariant Candidates") != NULL);
    assert(strstr(report, source_path) != NULL);
    assert(strstr(report, ":1") != NULL);
    assert(strstr(report, ":2") != NULL);
    assert(strstr(report, "`1500`") != NULL);
    assert(strstr(report, "`8`") != NULL);

    free(report);
    m0_lint_candidate_set_free(&set);
    assert(unlink(source_path) == 0);
    assert(unlink(report_path) == 0);
}

int main(void) {
    test_scanner_classifies_real_numeric_literals();
    test_report_emits_markdown_with_file_line_citations();
    puts("m0_anuttara_lint tests passed");
    return 0;
}
