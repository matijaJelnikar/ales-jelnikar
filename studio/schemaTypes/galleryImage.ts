import { defineField, defineType } from 'sanity';

export const galleryImage = defineType({
  name: 'galleryImage',
  type: 'document',
  title: 'Galerija',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Naslov',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Slika',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isAfter',
      type: 'boolean',
      title: 'Po vgradnji?',
      description: 'Označite, če je slika posneta po končani vgradnji.',
      initialValue: true,
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
      media: 'image',
      isAfter: 'isAfter',
    },
    prepare({ title, media, isAfter }) {
      return {
        title,
        subtitle: isAfter ? 'Po vgradnji' : 'Pred vgradnjo',
        media,
      };
    },
  },
});
