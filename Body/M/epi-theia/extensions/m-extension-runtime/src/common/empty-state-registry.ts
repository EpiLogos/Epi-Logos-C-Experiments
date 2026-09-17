import * as React from 'react';
import { injectable } from '@theia/core/shared/inversify';
import { Disposable } from '@theia/core/lib/common';
import { MExtensionReadinessSnapshot } from './readiness';

export interface EmptyStateProps {
    readonly snapshot: MExtensionReadinessSnapshot;
    readonly missingContributors?: readonly string[];
}

export interface EmptyStateRegistration {
    readonly extensionId: string;
    readonly viewId: string;
    readonly activationCondition: (snapshot: MExtensionReadinessSnapshot) => boolean;
    readonly component: React.ComponentType<EmptyStateProps>;
}

export interface EmptyStateRegistry {
    register(reg: EmptyStateRegistration): Disposable;
    resolve(extensionId: string, viewId: string): EmptyStateRegistration | undefined;
    all(): readonly EmptyStateRegistration[];
}

export const EMPTY_STATE_REGISTRY = Symbol('EmptyStateRegistry');

function keyOf(extensionId: string, viewId: string): string {
    return `${extensionId}::${viewId}`;
}

@injectable()
export class EmptyStateRegistryImpl implements EmptyStateRegistry {
    private readonly registrations = new Map<string, EmptyStateRegistration>();

    register(reg: EmptyStateRegistration): Disposable {
        const key = keyOf(reg.extensionId, reg.viewId);
        this.registrations.set(key, reg);
        return Disposable.create(() => {
            if (this.registrations.get(key) === reg) {
                this.registrations.delete(key);
            }
        });
    }

    resolve(extensionId: string, viewId: string): EmptyStateRegistration | undefined {
        return this.registrations.get(keyOf(extensionId, viewId));
    }

    all(): readonly EmptyStateRegistration[] {
        return Array.from(this.registrations.values());
    }
}
