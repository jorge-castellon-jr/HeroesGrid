import {
  GiCardRandom,
  GiPunchBlast,
  GiRapidshareArrow,
  GiRunningNinja,
} from "react-icons/gi";
export default {
  name: "rangerCardRef",
  type: "object",
  title: "Card",
  fields: [
    { title: "Name", name: "name", type: "string" },
    { title: "Effect", name: "desc", type: "text" },
    { title: "Extra Effect", name: "extraDesc", type: "text" },
    {
      title: "Type",
      name: "type",
      type: "string",
      options: {
        list: [
          { title: "Attack", value: "attack" },
          { title: "Reaction", value: "reaction" },
          { title: "Maneuver", value: "maneuver" },
        ],
      },
    },
    {
      title: "Damage",
      name: "damage",
      type: "object",
      fields: [
        { title: "Dice Damage", name: "dice", type: "number" },
        {
          title: "Static Damage",
          name: "static",
          description: "Does not include damage from extra effects",
          type: "number",
        },
      ],
    },
    { title: "Energy Cost", name: "cost", type: "number" },
    { title: "Shields", name: "shields", type: "number" },
    { title: "Quanity/Copies", name: "quantity", type: "number" },
  ],
  preview: {
    select: {
      name: "name",
      quantity: "quantity",
      type: "type",
    },
    prepare(selection) {
      const { name, quantity, type } = selection;
      let q = quantity > 1 ? ` x${quantity}` : "";
      let media = GiCardRandom;
      if (type == "attack") media = GiPunchBlast;
      if (type == "reaction") media = GiRapidshareArrow;
      if (type == "maneuver") media = GiRunningNinja;

      return {
        title: `${name}${q}`,
        media: media,
      };
    },
  },
};
