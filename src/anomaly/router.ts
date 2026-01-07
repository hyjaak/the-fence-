import { Decision } from './eventTypes.js';

export interface Sink {
  send(decision: Decision): void;
}

export class ConsoleSink implements Sink {
  send(decision: Decision): void {
    console.log(JSON.stringify(decision));
  }
}

export class InMemorySink implements Sink {
  public decisions: Decision[] = [];

  send(decision: Decision): void {
    this.decisions.push(decision);
  }

  clear(): void {
    this.decisions = [];
  }
}

export class Router {
  private sinks: Sink[] = [];

  addSink(sink: Sink): void {
    this.sinks.push(sink);
  }

  route(decision: Decision): void {
    for (const sink of this.sinks) {
      sink.send(decision);
    }
  }
}
