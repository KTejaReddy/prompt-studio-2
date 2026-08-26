/**
 * Matching engine configuration.
 *
 * Everything here is tunable without touching engine logic, so real user
 * behavior can recalibrate the system later (e.g. from analytics outcomes).
 */

export const MATCH_CONFIG = {
  /**
   * Verdict thresholds on the CALIBRATED score (the % shown to users):
   *   ≥ strongThreshold → return existing prompt directly
   *   ≥ relatedThreshold → show related prompts, offer customization
   *   below → consider generating a new prompt
   */
  strongThreshold: 0.9,
  relatedThreshold: 0.75,

  /** Weight blend for the raw hybrid score. */
  weights: {
    semantic: 0.34,
    keyword: 0.22,
    structured: 0.44,
  },

  /** Sub-factors inside the structured score. */
  structuredWeights: {
    taskMatch: 0.34,
    categoryMatch: 0.16,
    inputCompat: 0.14,
    outputCompat: 0.12,
    platformCompat: 0.08,
    quality: 0.1,
    popularity: 0.06,
  },

  /** Sigmoid calibration raw → display: display = 1/(1+e^-(raw-center)/scale).
   *  Steepness spreads scores across the decision bands. */
  calibration: {
    center: 0.58,
    scale: 0.07,
  },

  /** Composition (multi-step → workflow) rules. */
  compose: {
    minTasks: 3,
    minComplexity: 3,
    minDistinctPrompts: 3,
    /** Best single prompt must cover less than this fraction of intent tasks. */
    maxSingleCoverage: 0.75,
    /** Minimum per-prompt score to join a composed workflow. */
    memberScore: 0.45,
    maxSteps: 6,
  },

  search: {
    topK: 12,
  },
} as const;

export type MatchConfig = typeof MATCH_CONFIG;
