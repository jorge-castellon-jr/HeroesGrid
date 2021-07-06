import { IoIosPaper } from "react-icons/io";

export default {
  name: "rulebook",
  title: "Rulebooks",
  icon: IoIosPaper,
  type: "document",
  fields: [
    {
      name: "name",
      title: "Ranger's Name",
      type: "string",
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
