import type { StringKey } from './i18n.ts';

/**
 * The states a panel can be in, so every one of them is designed rather than
 * defaulted. They are four different things and the site says which one it is:
 *
 * - `NotConnected`: no integration exists yet. Nothing is missing, there is
 *   simply no source behind this panel.
 * - `Failed`: a source exists and did not answer this time.
 * - `Empty`: a source answered and has nothing recent for this place.
 * - `Loading`: data is on its way.
 */
export enum DataState {
  Ready = 'ready',
  Loading = 'loading',
  Empty = 'empty',
  Failed = 'failed',
  NotConnected = 'not-connected',
}

/** The wording for each state that has to be drawn. `Ready` renders no state. */
export const DATA_STATE_KEY: Record<Exclude<DataState, DataState.Ready>, StringKey> = {
  [DataState.Loading]: 'state.loading',
  [DataState.Empty]: 'state.noRecent',
  [DataState.Failed]: 'state.failed',
  [DataState.NotConnected]: 'state.notConnected',
};
