import { GiRobotLeg } from "react-icons/gi";

export default {
  name: "zord",
  title: "Zords",
  icon: GiRobotLeg,
  type: "document",
  fields: [
    {
      name: "name",
      title: "Zord's Name",
      type: "string",
    },
    {
      name: "ability",
      title: "Zord's Ability",
      type: "text",
    },
  ],
};
