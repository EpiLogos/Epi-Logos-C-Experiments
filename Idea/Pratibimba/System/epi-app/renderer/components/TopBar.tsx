import { useDomainStore } from '../stores/domainStore';
import { motion } from 'framer-motion';
import { cn } from '../../shared/utils';

export function TopBar() {
    const { currentDomain, setDomain, domains } = useDomainStore();

    return (
        <div className="h-12 flex items-center px-4 justify-between select-none app-drag-region glass z-50">
            <div className="flex items-center space-x-2 no-drag h-full">
                {domains.map((domain) => {
                    const isActive = currentDomain.id === domain.id;
                    return (
                        <button
                            key={domain.id}
                            onClick={() => setDomain(domain)}
                            className={cn(
                                "relative h-8 px-3 flex items-center text-[13px] font-medium transition-all duration-200 rounded-md",
                                isActive
                                    ? "text-[var(--text-primary)]"
                                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute inset-0 bg-[var(--bg-active)] rounded-md border border-[var(--border-subtle)]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 tracking-tight">{domain.name}</span>
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center space-x-4 no-drag">
                <div
                    className="text-[10px] font-mono px-2 py-0.5 rounded border flex items-center space-x-2 opacity-50 transition-opacity hover:opacity-100"
                    style={{
                        color: `var(--color-${currentDomain.id})`,
                        borderColor: `var(--border-subtle)`,
                        background: 'var(--bg-active)'
                    }}
                >
                    <span>{currentDomain.coordinate}</span>
                </div>
            </div>
        </div>
    );
}
