import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
// @ts-expect-error The production validator is an executable ESM script.
import { LEDGER_PATH, validateOnboardingCompletionLedger } from '../../scripts/validate-onboarding-completion-ledger.mjs';

describe('onboarding completion ledger (32.T32.13)', () => {
    it('validates the production 20-step ledger and active carrier view-id boundary', async () => {
        const value = JSON.parse(await readFile(LEDGER_PATH, 'utf8'));
        await expect(validateOnboardingCompletionLedger(value)).resolves.toEqual([]);
        expect(value.ledger).toHaveLength(20);
    });

    it('rejects duplicate ownership rows and null skip paths without reasons', async () => {
        const value = JSON.parse(await readFile(LEDGER_PATH, 'utf8'));
        value.ledger[1].stepId = value.ledger[0].stepId;
        delete value.ledger[0].skipReason;
        const errors = await validateOnboardingCompletionLedger(value);
        expect((errors as string[]).some(error => error.includes('duplicates'))).toBe(true);
        expect((errors as string[]).some(error => error.includes('skipReason'))).toBe(true);
    });
});
