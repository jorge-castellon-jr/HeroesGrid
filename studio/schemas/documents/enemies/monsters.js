import { GiSharpedTeethSkull } from "react-icons/gi";

export default {
  name: "monster",
  title: "Monsters",
  icon: GiSharpedTeethSkull,
  type: "document",
  fields: [
    {
      name: "name",
      title: "Monster's Name",
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
      title: "Monster's Order",
      type: "number",
    },

    {
      name: "image",
      title: "Monster's Image",
      type: "image",
    },
    {
      name: "Deck",
      title: "Monster's Deck",
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
