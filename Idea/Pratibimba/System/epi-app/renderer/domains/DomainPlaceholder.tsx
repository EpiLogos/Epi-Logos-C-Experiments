import { MPrimeDomain } from '../../shared/types';

interface DomainPlaceholderProps {
  domain: MPrimeDomain;
}

export function DomainPlaceholder({ domain }: DomainPlaceholderProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">{domain.icon}</div>
        <h2 className="text-2xl font-bold text-white mb-2">{domain.name}</h2>
        <p className="text-gray-400 mb-4">{domain.sanskritName}</p>
        <p className="text-gray-500 text-sm max-w-md">{domain.description}</p>
        <div
          className="mt-6 inline-block px-4 py-2 rounded text-sm"
          style={{
            backgroundColor: `${domain.color}20`,
            color: domain.color,
          }}
        >
          {domain.coordinate} Domain - Coming Soon
        </div>
      </div>
    </div>
  );
}
