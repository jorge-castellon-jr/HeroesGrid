import { GiCardRandom } from "react-icons/gi";

export default {
  name: "enemyCardRef",
  type: "object",
  title: "Card",
  fields: [
    { title: "Name", name: "name", type: "string" },
    { title: "Effect", name: "desc", type: "text" },
    {
      title: "Types",
      name: "types",
      type: "array",
      of: [
        {
          title: "Type",
          name: "type",
          type: "string",
          options: {
            list: [
              { title: "Fast", value: "fast" },
              { title: "Guard", value: "guard" },
              { title: "Passive", value: "passive" },
            ],
          },
        },
      ],
    },
    {
      title: "Health",
      name: "health",
      type: "number",
    },
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

      return {
        title: `${name}${q}`,
        media: media,
      };
    },
  },
};
