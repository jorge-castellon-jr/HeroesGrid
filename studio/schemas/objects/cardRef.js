import {
  GiCardRandom,
  GiPunchBlast,
  GiRapidshareArrow,
  GiRunningNinja,
} from "react-icons/gi";
export default {
  name: "cardRef",
  type: "object",
  title: "Card",
  fields: [
    { title: "Name", name: "name", type: "string" },
    { title: "Description", name: "desc", type: "text" },
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
        { title: "Dice", name: "dice", type: "number" },
        { title: "Static", name: "static", type: "number" },
      ],
    },
    { title: "Cost", name: "cost", type: "number" },
    { title: "Shields", name: "shields", type: "number" },
    { title: "Quanity", name: "quantity", type: "number" },
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
