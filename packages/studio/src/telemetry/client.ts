// Telemetry is removed from this build: the Studio records and sends nothing.
// The exports keep their signatures so existing call sites compile unchanged.

type EventProperties = Record<string, string | number | boolean | undefined>;

export function shouldTrack(): boolean {
  return false;
}

export function trackEvent(_event: string, _properties: EventProperties = {}): void {}
