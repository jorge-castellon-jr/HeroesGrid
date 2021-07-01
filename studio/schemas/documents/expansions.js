export default {
  name: "expansion",
  title: "Expansions",
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
