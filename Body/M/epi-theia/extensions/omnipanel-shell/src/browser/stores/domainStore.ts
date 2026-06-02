import { create } from 'zustand';
import { MPrimeDomain, MPRIME_DOMAINS } from '../../shared/types';

interface DomainState {
  currentDomain: MPrimeDomain;
  setDomain: (domain: MPrimeDomain) => void;
  // Initialize with M0 Proto-Logos
  domains: MPrimeDomain[];
}

export const useDomainStore = create<DomainState>((set) => ({
  currentDomain: MPRIME_DOMAINS[0], // Proto-Logos
  setDomain: (domain) => set({ currentDomain: domain }),
  domains: MPRIME_DOMAINS
}));
