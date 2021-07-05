import { RiTeamFill } from "react-icons/ri";

export default {
  name: "team",
  title: "Teams",
  icon: RiTeamFill,
  type: "document",
  fields: [
    {
      name: "name",
      title: "Teams's Name",
      type: "string",
    },
    {
      name: "gen",
      title: "Teams's Generation",
      type: "number",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        slugify: (input) =>
          input.replace(/\./g, "").replace(/\s+/g, "-").toLowerCase(),
      },
    },
    {
      name: "logo",
      title: "Teams's Logo",
      type: "image",
    },
  ],
};
