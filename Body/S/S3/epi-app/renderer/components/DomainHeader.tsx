import { useDomainStore } from '../stores/domainStore';

export function DomainHeader() {
  const { currentDomain } = useDomainStore();

  return (
    <header
      className="h-12 border-b border-gray-800 flex items-center px-4 gap-3"
      style={{
        background: `linear-gradient(90deg, ${currentDomain.color}10, transparent)`,
      }}
    >
      {/* Draggable region for window */}
      <div className="flex-1 h-full app-drag-region" />

      {/* Domain info */}
      <div className="flex items-center gap-2 text-sm">
        <span
          className="font-mono px-2 py-0.5 rounded text-xs"
          style={{
            backgroundColor: `${currentDomain.color}20`,
            color: currentDomain.color,
          }}
        >
          {currentDomain.coordinate}
        </span>
        <span className="text-white font-medium">{currentDomain.name}</span>
        <span className="text-gray-500">({currentDomain.sanskritName})</span>
      </div>
    </header>
  );
}
