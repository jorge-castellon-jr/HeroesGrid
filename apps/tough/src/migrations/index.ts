import * as migration_20251214_215349 from './20251214_215349';
import * as migration_20251216_200837 from './20251216_200837';
import * as migration_20251217_224216 from './20251217_224216';

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
    name: '20251217_224216'
  },
];
