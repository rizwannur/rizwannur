import * as migration_20260430_144118_add_seo_tags_drafts from './20260430_144118_add_seo_tags_drafts';

export const migrations = [
  {
    up: migration_20260430_144118_add_seo_tags_drafts.up,
    down: migration_20260430_144118_add_seo_tags_drafts.down,
    name: '20260430_144118_add_seo_tags_drafts'
  },
];
