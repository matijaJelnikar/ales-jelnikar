import { defineField, defineType } from 'sanity';

export const projekt = defineType({
  name: 'projekt',
  type: 'document',
  title: 'Projekti',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Naslov projekta',
      description: 'npr. "Mansarda, Ljubljana" ali "Dnevna soba, Kranj"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'imageAfter',
      type: 'image',
      title: 'Slika po vgradnji',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Opis slike (za Google)',
          description: 'Kratko opišite sliko, npr. "Vgradnja VELUX okna v mansardo, Ljubljana"',
          validation: (Rule) => Rule.required().warning('Opis slike pomaga pri iskanju na Googlu.'),
        }),
      ],
    }),
    defineField({
      name: 'imageBefore',
      type: 'image',
      title: 'Slika pred vgradnjo (neobvezno)',
      description: 'Če jo dodate, bo prikazana primerjava pred/po.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Opis slike (za Google)',
          description: 'npr. "Staro strešno okno pred zamenjavo"',
        }),
      ],
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Vrstni red',
      description: 'Nižja številka = prikazano prej.',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Vrstni red',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'imageAfter',
      imageBefore: 'imageBefore',
    },
    prepare({ title, media, imageBefore }) {
      return {
        title,
        subtitle: imageBefore ? 'Pred & po' : 'Samo po',
        media,
      };
    },
  },
});
