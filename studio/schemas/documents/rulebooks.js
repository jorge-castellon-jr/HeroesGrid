export default {
  name: "rulebook",
  title: "Rulebooks",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Ranger's Name",
      type: "string",
    },
    {
      name: "content",
      title: "Content",
      type: "markdown",
      options: {
        maxHeight: "600px",
      },
    },
    {
      name: "pdf",
      title: "PDF",
      type: "file",
    },
  ],
};
