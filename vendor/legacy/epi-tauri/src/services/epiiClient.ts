import { invoke } from './invoke';
import { graphClient } from './graphClient';
import { vaultClient } from './vaultClient';
import type {
  AtelierSession,
  AtelierWord,
  AtelierConstellation,
  AgentRunHandle,
  Confidence,
  WordRegister,
  SubGraphGeometry,
  GeometryClass,
  MefLens,
  MefLensId,
  LibrarySearchResult,
  LibrarySearchQuery,
} from './types';

export const epiiClient = {
  library: {
    ecologyView: () => invoke<unknown>('library_ecology_view'),
    getCanonicalArtifacts: () => vaultClient.getFileTree(),
    getCanonicalFile: (path: string) => vaultClient.getFileContent(path),
    search: (query: LibrarySearchQuery) =>
      invoke<LibrarySearchResult[]>('library_search', { query }),
  },

  atelier: {
    sessionStart: (userIdHash: string) =>
      invoke<AtelierSession>('atelier_session_start', { userIdHash }),
    addWord: (sessionId: string, word: string) =>
      invoke<AtelierWord>('atelier_add_word', { sessionId, word }),
    dialogueTurn: (sessionId: string, userMessage: string, qlHint?: number) =>
      invoke<AgentRunHandle>('atelier_dialogue_turn', { sessionId, userMessage, qlHint }),
    setRegister: (
      sessionId: string,
      wordA: string,
      wordB: string,
      register: WordRegister,
      confidence: Confidence,
      citedSource?: string,
    ) =>
      invoke<void>('atelier_set_register', {
        sessionId,
        wordA,
        wordB,
        register,
        confidence,
        citedSource,
      }),
    setQlPosition: (sessionId: string, word: string, qlPosition: number, essence: string) =>
      invoke<void>('atelier_set_ql_position', { sessionId, word, qlPosition, essence }),
    crystallize: (
      sessionId: string,
      constellationName: string,
      aphorismText: string,
      aphorismType: string,
    ) =>
      invoke<unknown>('atelier_crystallize', {
        sessionId,
        constellationName,
        aphorismText,
        aphorismType,
      }),
    listWords: () => invoke<AtelierWord[]>('atelier_list_words'),
    listConstellations: () =>
      invoke<AtelierConstellation[]>('atelier_list_constellations'),
  },

  bimbaWalk: graphClient.walk,
  bimbaByCoordinate: graphClient.getByCoordinate,
  bimbaGeometry: (coordinate: string) => graphClient.geometryFor(coordinate),
  bimbaSetGeometryOverride: (coordinate: string, geometryClass: GeometryClass) =>
    graphClient.setGeometryOverride(coordinate, geometryClass),

  mef: {
    listLenses: () => invoke<MefLens[]>('mef_list_lenses'),
    getActiveLens: () => invoke<MefLens>('mef_get_active_lens'),
    lensCommentaryFor: (coordinate: string, lens: MefLensId) =>
      invoke<unknown>('mef_lens_commentary', { coordinate, lens }),
  },
};
