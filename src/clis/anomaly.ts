#!/usr/bin/env node
import { Command } from 'commander';
import { createInterface } from 'readline';
import { readFile } from 'fs/promises';
import { createReadStream } from 'fs';
import { AnomalyEngine } from '../anomaly/engine.js';
import { isEvent } from '../anomaly/eventTypes.js';

const program = new Command();

program
  .name('anomaly')
  .description('Infrastructure anomaly detection')
  .option('-f, --file <path>', 'Path to NDJSON events file (reads from stdin if omitted)')
  .action(async (options) => {
    const engine = new AnomalyEngine({ enableConsoleOutput: true });

    try {
      let lineReader;
      
      if (options.file) {
        const stream = createReadStream(options.file);
        lineReader = createInterface({
          input: stream,
          crlfDelay: Infinity,
        });
      } else {
        lineReader = createInterface({
          input: process.stdin,
          crlfDelay: Infinity,
        });
      }

      for await (const line of lineReader) {
        if (!line.trim()) continue;

        try {
          const obj = JSON.parse(line);
          if (!isEvent(obj)) {
            console.error(JSON.stringify({ error: 'Invalid event format', line }));
            continue;
          }
          engine.process(obj);
        } catch (err) {
          console.error(JSON.stringify({ error: 'Parse error', line, message: err instanceof Error ? err.message : String(err) }));
        }
      }

      process.exit(0);
    } catch (error) {
      console.error(JSON.stringify({ error: 'Fatal error', message: error instanceof Error ? error.message : String(error) }));
      process.exit(1);
    }
  });

program.parse(process.argv);
