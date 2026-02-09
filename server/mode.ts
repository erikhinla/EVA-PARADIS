/**
 * Mode detection utility for publishing pipeline
 * Determines if RedGifs/Reddit should use auto-mode (API) or manual mode (user input)
 */

export type PublishingMode = 'auto' | 'manual';

export interface PublishingModeConfig {
  redgifs: PublishingMode;
  reddit: PublishingMode;
}

/**
 * Check publishing mode based on environment variables
 * Returns 'auto' if API credentials are present, 'manual' otherwise
 */
export function getPublishingMode(): PublishingModeConfig {
  // Check RedGifs credentials
  const hasRedGifs = !!(
    process.env.REDGIFS_API_KEY || 
    process.env.REDGIFS_ACCESS_TOKEN
  );

  // Check Reddit credentials
  const hasReddit = !!(
    process.env.REDDIT_CLIENT_ID && 
    process.env.REDDIT_CLIENT_SECRET &&
    process.env.REDDIT_USERNAME &&
    process.env.REDDIT_PASSWORD
  );

  return {
    redgifs: hasRedGifs ? 'auto' : 'manual',
    reddit: hasReddit ? 'auto' : 'manual',
  };
}

/**
 * Check if fully automated mode is available
 */
export function isFullyAutoMode(): boolean {
  const mode = getPublishingMode();
  return mode.redgifs === 'auto' && mode.reddit === 'auto';
}

/**
 * Check if any manual steps are required
 */
export function requiresManualSteps(): boolean {
  return !isFullyAutoMode();
}
