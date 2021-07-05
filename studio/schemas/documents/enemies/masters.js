import { GiCrownedSkull } from "react-icons/gi";

export default {
  name: "master",
  title: "Masters",
  icon: GiCrownedSkull,
  type: "document",
  fields: [
    {
      name: "name",
      title: "Master's Name",
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
      title: "Master's Order",
      type: "number",
    },

    {
      name: "image",
      title: "Master's Image",
      type: "image",
    },
    {
      name: "Deck",
      title: "Master's Deck",
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
