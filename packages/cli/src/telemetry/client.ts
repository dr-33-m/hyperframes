// This fork ships without telemetry: nothing is queued, sent, or disclosed.
// The call sites in events.ts and elsewhere keep their signatures so the
// instrumentation can be deleted in a later pass without touching the commands.

let telemetryEnabled: boolean | null = null;

export function shouldTrack(): boolean {
  telemetryEnabled = false;
  return telemetryEnabled;
}

export function resetTelemetryPostureCache(): void {
  telemetryEnabled = null;
}

export function trackEvent(_event: string, _properties: unknown = {}, _distinctId?: string): void {}

export function showTelemetryNotice(): boolean {
  return false;
}

export function flush(): Promise<void> {
  return Promise.resolve();
}

export function flushSync(): void {}
