interface SocketMonitoringCounters {
  connected: number;
  disconnected: number;
  rejected: number;
  rateLimited: number;
  invalidPayload: number;
}

interface MonitoringCounters {
  gamesCreated: number;
  gamesFinished: number;
  matchmakingStarted: number;
  matchmakingMatched: number;
  clientErrors: number;
  uncaughtExceptions: number;
  unhandledRejections: number;
  apiRequests: number;
  socket: SocketMonitoringCounters;
}

export class MonitoringStore {
  private counters: MonitoringCounters = {
    gamesCreated: 0,
    gamesFinished: 0,
    matchmakingStarted: 0,
    matchmakingMatched: 0,
    clientErrors: 0,
    uncaughtExceptions: 0,
    unhandledRejections: 0,
    apiRequests: 0,
    socket: {
      connected: 0,
      disconnected: 0,
      rejected: 0,
      rateLimited: 0,
      invalidPayload: 0,
    },
  };

  increment(path: string) {
    const parts = path.split('.');
    let target: Record<string, unknown> = this.counters as unknown as Record<string, unknown>;

    for (let index = 0; index < parts.length - 1; index += 1) {
      target = target[parts[index]] as Record<string, unknown>;
    }

    const leaf = parts[parts.length - 1];
    target[leaf] = Number(target[leaf] ?? 0) + 1;
  }

  snapshot() {
    return JSON.parse(JSON.stringify(this.counters)) as MonitoringCounters;
  }
}
