import { RiSkullFill } from "react-icons/ri";

export default {
  name: "footsoldier",
  title: "Foot Soldiers",
  icon: RiSkullFill,
  type: "document",
  fields: [
    {
      name: "name",
      title: "Footsoldier's Name",
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
      title: "Footsoldier's Order",
      type: "number",
    },

    {
      name: "image",
      title: "Footsoldier's Image",
      type: "image",
    },
    {
      name: "Deck",
      title: "Footsoldier's Deck",
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
