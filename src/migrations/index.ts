import * as migration_20260430_110907 from './20260430_110907';

export const migrations = [
  {
    up: migration_20260430_110907.up,
    down: migration_20260430_110907.down,
    name: '20260430_110907'
  },
];
