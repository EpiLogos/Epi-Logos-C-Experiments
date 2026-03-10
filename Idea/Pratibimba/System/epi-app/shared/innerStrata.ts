/**
 * Inner Stratum Specifications for all M' domains
 * Source: M-M-PRIME-COORDINATE-SYSTEM.md
 */

export type InnerStratum = '0\'' | '1\'' | '2\'' | '3\'' | '4\'' | '5\'';

export interface InnerStratumSpec {
  coordinate: string;        // M0-0', M0-1', etc.
  name: string;              // Display name
  icon: string;              // Icon description
  priority: 'high' | 'standard';  // Implementation priority
  description: string;       // Function description
}

export interface DomainInnerStrata {
  domainId: string;          // m0, m1, m2, etc.
  domainName: string;        // Anuttara, Paramasiva, etc.
  strata: InnerStratumSpec[];
}

/**
 * Complete inner stratum specifications for all 6 domains
 */
export const DOMAIN_INNER_STRATA: Record<string, DomainInnerStrata> = {
  m0: {
    domainId: 'm0',
    domainName: 'Anuttara',
    strata: [
      {
        coordinate: 'M0-0\'',
        name: '4-Fold Zero',
        icon: 'solid-black-circle',
        priority: 'standard',
        description: 'Apophatic Ground workspace'
      },
      {
        coordinate: 'M0-1\'',
        name: '8-Fold Zero-Zero',
        icon: 'dual-spiral',
        priority: 'standard',
        description: '(00)/00 generative pulse visualization'
      },
      {
        coordinate: 'M0-2\'',
        name: 'Equative Bridge',
        icon: 'equals-in-circle',
        priority: 'standard',
        description: '(00)x00=9, Virtue System'
      },
      {
        coordinate: 'M0-3\'',
        name: 'Archetypal Numerology',
        icon: 'numeric-star',
        priority: 'high',
        description: 'Interactive 1-9 encyclopedia'
      },
      {
        coordinate: 'M0-4\'',
        name: 'Linguistic Mapping',
        icon: 'linguistic-scroll',
        priority: 'standard',
        description: 'Neosemantics translation, domain mapping'
      },
      {
        coordinate: 'M0-5\'',
        name: 'Siva-Shakti Unity',
        icon: 'holistic-network',
        priority: 'high',
        description: '2D Force Graph Bimba Explorer'
      }
    ]
  },

  m1: {
    domainId: 'm1',
    domainName: 'Paramasiva',
    strata: [
      {
        coordinate: 'M1-0\'',
        name: 'Bimba Ground',
        icon: 'singular-point',
        priority: 'standard',
        description: '0/1 Primary Binary, number source'
      },
      {
        coordinate: 'M1-1\'',
        name: 'Pratibimba Reflection',
        icon: 'mirrored-line',
        priority: 'standard',
        description: '1/0 Inverse, Genus 1 from Void'
      },
      {
        coordinate: 'M1-2\'',
        name: 'Ananda Matrices',
        icon: '3-6-9-triangle',
        priority: 'standard',
        description: '6 matrices, 3-6-9 Spirit Axis'
      },
      {
        coordinate: 'M1-3\'',
        name: 'Spanda Process',
        icon: 'pulsing-torus',
        priority: 'high',
        description: '3D Genus-0→Genus-1 torus'
      },
      {
        coordinate: 'M1-4\'',
        name: 'QL Flowering',
        icon: '6-petaled-flower',
        priority: 'standard',
        description: 'Six-Position Framework (Mod6)'
      },
      {
        coordinate: 'M1-5\'',
        name: 'Topological Eye',
        icon: 'wide-angle-eye',
        priority: 'high',
        description: 'Dynamic data slicing, ML backend'
      }
    ]
  },

  m2: {
    domainId: 'm2',
    domainName: 'Parashakti',
    strata: [
      {
        coordinate: 'M2-0\'',
        name: 'Vibrational Ground',
        icon: 'glowing-seed',
        priority: 'standard',
        description: '36×2 double-covering, 1.777 harmonic ratio'
      },
      {
        coordinate: 'M2-1\'',
        name: 'Meta-Logikon (MEF)',
        icon: 'kaleidoscopic-iris',
        priority: 'standard',
        description: '6-lens kaleidoscope interface'
      },
      {
        coordinate: 'M2-2\'',
        name: 'Ontological Architecture',
        icon: '36-stepped-mountain',
        priority: 'standard',
        description: '36 Tattvas, Pravritti/Nivritti loops'
      },
      {
        coordinate: 'M2-3\'',
        name: 'Modulation Matrix',
        icon: '36-spoked-wheel',
        priority: 'standard',
        description: '36 Decans, 72 Light/Shadow expressions'
      },
      {
        coordinate: 'M2-4\'',
        name: 'Reality Actualization',
        icon: 'vibrating-string',
        priority: 'standard',
        description: '72 Maqamat, 72 Names, Bija-Mantras'
      },
      {
        coordinate: 'M2-5\'',
        name: 'The Cymascope',
        icon: 'cymatic-mandala',
        priority: 'high',
        description: 'Planetary sequencer, cymatic WebGL'
      }
    ]
  },

  m3: {
    domainId: 'm3',
    domainName: 'Mahamaya',
    strata: [
      {
        coordinate: 'M3-0\'',
        name: 'SU(2) & Quaternions',
        icon: 'complex-knot',
        priority: 'standard',
        description: 'Double-covering (720°), rotational logic'
      },
      {
        coordinate: 'M3-1\'',
        name: 'I-Ching Explorer',
        icon: 'broken-unbroken-lines',
        priority: 'standard',
        description: '64 hexagram browser, binary theory'
      },
      {
        coordinate: 'M3-2\'',
        name: 'Genetic Code',
        icon: 'double-helix',
        priority: 'standard',
        description: '64 codons, DNA-symbolic isomorphism'
      },
      {
        coordinate: 'M3-3\'',
        name: 'Transcription Dynamics',
        icon: 'pulse-wave',
        priority: 'standard',
        description: 'T → U transformation, symbolic dynamics'
      },
      {
        coordinate: 'M3-4\'',
        name: 'Tarot Matrix',
        icon: 'spinning-tarot-card',
        priority: 'standard',
        description: '78-card rotational, epigenetic augmentation'
      },
      {
        coordinate: 'M3-5\'',
        name: 'The Chronos Clock',
        icon: '720-degree-wheel',
        priority: 'high',
        description: 'Live D3.js, NLP from Nara'
      }
    ]
  },

  m4: {
    domainId: 'm4',
    domainName: 'Nara',
    strata: [
      {
        coordinate: 'M4-0\'',
        name: 'Identity Matrix',
        icon: 'identity-matrix-grid',
        priority: 'standard',
        description: 'Archetypal Signature repository'
      },
      {
        coordinate: 'M4-1\'',
        name: 'Sympathetic Med',
        icon: 'medical-caduceus',
        priority: 'standard',
        description: 'Eastern/Western integration paradigm'
      },
      {
        coordinate: 'M4-2\'',
        name: 'Oracle Suite',
        icon: 'oracle-deck',
        priority: 'standard',
        description: 'Tarot/I-Ching readings, daily reflection'
      },
      {
        coordinate: 'M4-3\'',
        name: 'Transformation',
        icon: 'alchemical-symbol',
        priority: 'standard',
        description: 'Alchemical tracking, symbolic history'
      },
      {
        coordinate: 'M4-4\'',
        name: 'Lens Library',
        icon: 'crystal-lens',
        priority: 'high',
        description: 'Journal, read/speak, lenses'
      },
      {
        coordinate: 'M4-5\'',
        name: 'Learning Comp',
        icon: 'book-lightbulb',
        priority: 'standard',
        description: 'Insight distillation, bridge to Epii'
      }
    ]
  },

  m5: {
    domainId: 'm5',
    domainName: 'Epii',
    strata: [
      {
        coordinate: 'M5-0\'',
        name: 'The Library',
        icon: 'geometric-folio',
        priority: 'high',
        description: 'MÖBIUS END - Knowledge Hub, recursive tree'
      },
      {
        coordinate: 'M5-1\'',
        name: 'Epi-Logos Philosophy',
        icon: 'quill-scroll',
        priority: 'standard',
        description: 'Historical synthesis, canon building'
      },
      {
        coordinate: 'M5-2\'',
        name: 'Siva Layer',
        icon: 'structural-lattice',
        priority: 'standard',
        description: 'Service monitoring, API management'
      },
      {
        coordinate: 'M5-3\'',
        name: 'Shakti Layer',
        icon: 'creative-pulse',
        priority: 'standard',
        description: 'Functional specs, Kinetic Logos planning'
      },
      {
        coordinate: 'M5-4\'',
        name: 'Siva-Shakti',
        icon: 'entwined-spirals',
        priority: 'standard',
        description: 'Agent control room'
      },
      {
        coordinate: 'M5-5\'',
        name: 'The Atelier',
        icon: 'archaeological-pickaxe',
        priority: 'high',
        description: 'Etymological Archaeology, Möbius start'
      }
    ]
  }
};

/**
 * Get inner strata specification for a domain
 */
export function getDomainStrata(domainId: string): DomainInnerStrata | null {
  return DOMAIN_INNER_STRATA[domainId] || null;
}

/**
 * Get specific stratum specification
 */
export function getStratumSpec(domainId: string, stratum: InnerStratum): InnerStratumSpec | null {
  const domain = DOMAIN_INNER_STRATA[domainId];
  if (!domain) return null;

  const stratumNum = parseInt(stratum.replace("'", ''));
  return domain.strata[stratumNum] || null;
}
