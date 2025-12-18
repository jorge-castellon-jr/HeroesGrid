import * as migration_20251214_215349 from './20251214_215349';
import * as migration_20251216_200837 from './20251216_200837';
import * as migration_20251217_224216 from './20251217_224216';
import * as migration_20251218_192537 from './20251218_192537';
import * as migration_20251218_210156 from './20251218_210156';

export const migrations = [
  {
    up: migration_20251214_215349.up,
    down: migration_20251214_215349.down,
    name: '20251214_215349',
  },
  {
    up: migration_20251216_200837.up,
    down: migration_20251216_200837.down,
    name: '20251216_200837',
  },
  {
    up: migration_20251217_224216.up,
    down: migration_20251217_224216.down,
    name: '20251217_224216',
  },
  {
    up: migration_20251218_192537.up,
    down: migration_20251218_192537.down,
    name: '20251218_192537',
  },
  {
    up: migration_20251218_210156.up,
    down: migration_20251218_210156.down,
    name: '20251218_210156'
  },
];
