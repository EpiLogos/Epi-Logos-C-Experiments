import { injectable } from '@theia/core/shared/inversify';
import {
    CanonDecoration,
    scanCanonDecorations
} from '../common';

@injectable()
export class CanonDecorationService {
    scan(markdown: string): readonly CanonDecoration[] {
        return scanCanonDecorations(markdown);
    }
}
