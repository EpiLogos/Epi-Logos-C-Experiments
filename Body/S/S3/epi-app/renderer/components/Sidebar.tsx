import { AnimatePresence, motion } from 'framer-motion';
import { CircleDot, CornerDownRight, Square, Triangle } from 'lucide-react';
import { cn } from '../../shared/utils';
import { getDomainStrata, InnerStratum } from '../../shared/innerStrata';
import { useDomainStore } from '../stores/domainStore';
import { usePanelStore } from '../stores/panelStore';

interface NavItem {
  id: string;
  label: string;
  stratum: InnerStratum;
  glyph: 'dot' | 'line' | 'angle' | 'triangle' | 'square' | 'donut';
}

const QL_GLYPHS: NavItem['glyph'][] = ['dot', 'line', 'angle', 'triangle', 'square', 'donut'];

function QLGlyph({ glyph }: { glyph: NavItem['glyph'] }) {
  switch (glyph) {
    case 'dot':
      return <span data-testid="ql-glyph-dot" className="inline-block h-1.5 w-1.5 rounded-full bg-current" />;
    case 'line':
      return <span data-testid="ql-glyph-line" className="inline-block h-px w-3 bg-current" />;
    case 'angle':
      return <CornerDownRight data-testid="ql-glyph-angle" size={12} strokeWidth={1.6} />;
    case 'triangle':
      return <Triangle data-testid="ql-glyph-triangle" size={12} strokeWidth={1.6} />;
    case 'square':
      return <Square data-testid="ql-glyph-square" size={12} strokeWidth={1.6} />;
    case 'donut':
      return <CircleDot data-testid="ql-glyph-donut" size={12} strokeWidth={1.6} />;
  }
}

export function SideBar() {
  const { currentDomain } = useDomainStore();
  const { toggleStratum, activeStratum } = usePanelStore();

  const getDomainNavItems = (): NavItem[] => {
    const domainStrata = getDomainStrata(currentDomain.id);
    if (!domainStrata) return [];

    return domainStrata.strata.map((stratum, index) => {
      const stratumNum = `${index}'` as InnerStratum;
      return {
        id: stratum.coordinate,
        label: stratum.name,
        stratum: stratumNum,
        glyph: QL_GLYPHS[index] ?? 'dot'
      };
    });
  };

  const navItems = getDomainNavItems();

  return (
    <motion.aside className="w-10 h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col items-center py-3 relative z-30">
      <div className="flex-1 flex flex-col justify-start gap-3 w-full px-0.5">
        <AnimatePresence mode="sync">
          {navItems.map((item) => {
            const isActive = activeStratum === item.stratum;

            return (
              <div key={`${currentDomain.id}-${item.id}`} className="relative group flex justify-center">
                <motion.button
                  initial={{ opacity: 0.7, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.7, scale: 0.96 }}
                  onClick={() => toggleStratum(item.stratum)}
                  aria-label={`${item.id} ${item.label}`}
                  title={`${item.id} ${item.label}`}
                  className={cn(
                    'h-7 w-7 transition-colors duration-150',
                    'flex items-center justify-center',
                    isActive ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                  )}
                  style={{ color: `var(--color-${currentDomain.id})` }}
                >
                  <QLGlyph glyph={item.glyph} />
                </motion.button>
              </div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
