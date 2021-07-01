export default {
  name: "team",
  title: "Teams",
  type: "document",
  fields: [
    {
      name: "season",
      title: "Teams's Season",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "season",
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
