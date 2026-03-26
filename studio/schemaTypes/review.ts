import { defineField, defineType } from 'sanity';

export const review = defineType({
  name: 'review',
  type: 'document',
  title: 'Ocene strank',
  fields: [
    defineField({
      name: 'text',
      type: 'text',
      title: 'Besedilo ocene',
      rows: 4,
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'author',
      type: 'string',
      title: 'Ime stranke',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      type: 'string',
      title: 'Kraj',
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
      title: 'author',
      subtitle: 'location',
    },
  },
});
