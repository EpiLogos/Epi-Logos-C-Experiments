import { useDomainStore } from '../stores/domainStore';
import { motion } from 'framer-motion';
import { cn } from '../../shared/utils';

export function BottomNavigation() {
    const { currentDomain, setDomain, domains } = useDomainStore();

    return (
        <div className="h-10 w-full flex items-center justify-center select-none z-50 glass border-t-0 pointer-events-auto">
            <div className="flex items-center space-x-1 h-full">
                {domains.map((domain) => {
                    const isActive = currentDomain.id === domain.id;
                    return (
                        <button
                            key={domain.id}
                            onClick={() => setDomain(domain)}
                            className={cn(
                                "relative h-full px-5 flex items-center justify-center text-[12px] font-medium transition-colors duration-200",
                                isActive
                                    ? "text-white"
                                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/5"
                            )}
                        >
                            <span className="relative z-10 tracking-widest uppercase text-[10px]">{domain.name}</span>

                            {isActive && (
                                <motion.div
                                    layoutId="activeFlushTab"
                                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                                    style={{ backgroundColor: `var(--color-${domain.id})`, boxShadow: `0 -2px 10px var(--color-${domain.id})` }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
