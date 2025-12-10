import * as migration_20251214_215349 from './20251214_215349'

export const migrations = [
  {
    up: migration_20251214_215349.up,
    down: migration_20251214_215349.down,
    name: '20251214_215349',
  },
]
