import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

export default defineConfig({
  name: 'ales-jelnikar',
  title: 'Aleš Jelnikar – VELUX',

  projectId: 'c6ywppl5',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Vsebina')
          .items([
            S.listItem()
              .title('Projekti (galerija)')
              .icon(() => '🖼️')
              .child(S.documentTypeList('projekt').title('Projekti')),
            S.listItem()
              .title('Ocene strank')
              .icon(() => '⭐')
              .child(S.documentTypeList('review').title('Ocene strank')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
