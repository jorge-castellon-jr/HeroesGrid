import { BiLayerPlus } from "react-icons/bi";

export default {
  name: "expansion",
  title: "Expansions",
  icon: BiLayerPlus,
  type: "document",
  fields: [
    {
      name: "name",
      title: "Expansion's Name",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        slugify: (input) =>
          input
            .replace(/\./g, "")
            .replace(/:/g, "")
            .replace(/#/g, "")
            .replace(/\s+/g, "-")
            .replace(/legendary-rangers-/i, "")
            .replace(/legendary-ranger-/i, "")
            .replace(/-game/i, "")
            .toLowerCase(),
      },
    },
    {
      name: "type",
      title: "Type of Content",
      type: "array",
      of: [
        {
          name: "inlcude",
          title: "Includes",
          type: "string",

          options: {
            list: [
              { title: "Rangers", value: "ranger" },
              { title: "Megazords", value: "megazord" },
              { title: "Foot Soldiers", value: "minion" },
              { title: "Monsters", value: "monster" },
              { title: "Nemesis", value: "nemesis" },
              { title: "Bosses", value: "boss" },
            ],
          },
        },
      ],
    },
    {
      name: "phase",
      title: "Release Phase",
      type: "string",
    },
    {
      name: "release",
      title: "Release Date",
      type: "date",
    },
    {
      name: "image",
      title: "Teams's Image",
      type: "image",
    },
  ],
};
