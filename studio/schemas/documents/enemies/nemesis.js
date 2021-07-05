import { GiDaemonSkull } from "react-icons/gi";

export default {
  name: "nemesis",
  title: "Nemesis",
  icon: GiDaemonSkull,
  type: "document",
  fields: [
    {
      name: "name",
      title: "Nemesis's Name",
      type: "string",
    },

    {
      name: "expansion",
      title: "Release",
      type: "reference",
      to: [{ type: "expansion" }],
    },
    {
      title: "Exclusive?",
      name: "exclusive",
      type: "boolean",
    },

    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
      },
    },
    {
      name: "team",
      title: "Ranger's Team",
      type: "reference",
      to: [{ type: "team" }],
    },

    {
      name: "order",
      title: "Nemesis's Order",
      type: "number",
    },

    {
      name: "image",
      title: "Nemesis's Image",
      type: "image",
    },
    {
      name: "Deck",
      title: "Nemesis's Deck",
      type: "array",
      options: {
        editModal: "popover",
      },
      of: [
        {
          name: "card",
          title: "Card",
          type: "enemyCardRef",
        },
      ],
    },
  ],
  initialValue: {
    exclusive: false,
  },
};
