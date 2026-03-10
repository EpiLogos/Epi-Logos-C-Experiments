import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDomainStore } from '../stores/domainStore';
import { cn } from '../../shared/utils';
import { Settings, Command, PanelLeft, PanelRight } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useLayoutStore } from '../stores/layoutStore';
import type { ThemeMode } from '../stores/themeStore';


export function Header() {
    const { currentDomain, setDomain, domains } = useDomainStore();
    const { setMode, mode } = useThemeStore();
    const { panels, togglePanel } = useLayoutStore();
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const isNara = currentDomain.id === 'm4';

    const baseThemeOptions = useMemo<Array<{ id: ThemeMode; label: string }>>(() => {
        return [
            { id: 'dark', label: 'Dark' },
            { id: 'light', label: 'Light' },
            { id: 'glass', label: 'Glass' },
        ];
    }, []);
    const naraThemeOptions = useMemo<Array<{ id: ThemeMode; label: string }>>(() => {
        if (!isNara) return [];
        return [
            { id: 'nara-dark', label: 'Nara Dark' },
            { id: 'nara-light', label: 'Nara Light' },
            { id: 'nara-glass', label: 'Nara Glass' },
        ];
    }, [isNara]);

    useEffect(() => {
        const onMouseDown = (event: MouseEvent) => {
            if (!themeMenuOpen) return;
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setThemeMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, [themeMenuOpen]);

    return (
        <header
            className="w-full h-10 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/80 backdrop-blur-md z-40 relative app-drag-region select-none group/header hover:bg-[var(--bg-app)] transition-colors duration-300"
        >
            {/* Container for Hover Interaction */}
            <div className="w-full h-full flex items-center justify-between px-4 opacity-0 group-hover/header:opacity-100 transition-opacity duration-300">

                {/* Left: Spacer to clear Traffic Lights (~80px) */}
                <div className="w-20 flex-shrink-0" />

                {/* Center: Domain Navigation (The Subsystem Menu) */}
                <div className="flex-1 flex items-center justify-center space-x-1 no-drag">
                    {domains.map((domain) => {
                        const isActive = currentDomain.id === domain.id;
                        return (
                            <button
                                key={domain.id}
                                onClick={() => setDomain(domain)}
                                className={cn(
                                    "relative px-3 py-1 flex items-center justify-center text-[10px] font-medium transition-colors duration-200 rounded hover:bg-white/5",
                                    isActive
                                        ? "text-white"
                                        : "text-[var(--text-tertiary)]"
                                )}
                            >
                                <span className="tracking-wider uppercase">{domain.name}</span>
                                {isActive && (
                                    <div
                                        className="absolute bottom-0 w-full h-[1px]"
                                        style={{ backgroundColor: `var(--color-${domain.id})` }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Right: System Tools (from old Footer) */}
                <div className="flex items-center space-x-4 flex-shrink-0 no-drag">
                    <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                            <Command size={10} /> K
                        </span>
                    </div>

                    {/* Layout Toggles (Tryptic Design Pattern) */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => togglePanel('left')}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${panels.left ? 'bg-white/20 border-white/20 text-white' : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:bg-white/10'}`}
                            title="Toggle Left Panel"
                        >
                            <PanelLeft size={12} />
                        </button>
                        <button
                            onClick={() => togglePanel('right')}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${panels.right ? 'bg-white/20 border-white/20 text-white' : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:bg-white/10'}`}
                            title="Toggle Right Panel"
                        >
                            <PanelRight size={12} />
                        </button>
                    </div>

                    {/* Theme Toggle (Temporary Location) */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setThemeMenuOpen((open) => !open)}
                            className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                            title={`Current Theme: ${mode}`}
                        >
                            <Settings size={12} className="text-[var(--text-secondary)]" />
                        </button>
                        {themeMenuOpen && (
                            <div className="absolute right-0 top-8 z-50 min-w-36 border border-[var(--border-subtle)] bg-[var(--bg-omnipanel)] p-1 shadow-xl backdrop-blur-md">
                                <p className="px-2 py-1 text-[9px] uppercase tracking-wide text-[var(--text-tertiary)]">Core</p>
                                {baseThemeOptions.map((option) => {
                                    const isSelected = option.id === mode;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setMode(option.id);
                                                setThemeMenuOpen(false);
                                            }}
                                            className={cn(
                                                'flex w-full items-center justify-between px-2 py-1 text-left text-[11px] transition-colors',
                                                isSelected ? 'bg-[var(--bg-active)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                            )}
                                        >
                                            <span>{option.label}</span>
                                            {isSelected ? <span className="text-[10px]">●</span> : null}
                                        </button>
                                    );
                                })}
                                {isNara ? <p className="px-2 py-1 pt-2 text-[9px] uppercase tracking-wide text-[var(--text-tertiary)]">Nara</p> : null}
                                {naraThemeOptions.map((option) => {
                                    const isSelected = option.id === mode;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setMode(option.id);
                                                setThemeMenuOpen(false);
                                            }}
                                            className={cn(
                                                'flex w-full items-center justify-between px-2 py-1 text-left text-[11px] transition-colors',
                                                isSelected ? 'bg-[var(--bg-active)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                            )}
                                        >
                                            <span>{option.label}</span>
                                            {isSelected ? <span className="text-[10px]">●</span> : null}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </header>
    );
}
