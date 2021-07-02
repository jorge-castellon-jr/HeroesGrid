import { GiRobotGolem } from "react-icons/gi";

export default {
  name: "megazord",
  title: "Megazords",
  icon: GiRobotGolem,
  type: "document",
  fields: [
    {
      name: "name",
      title: "Megazord's Name",
      type: "string",
    },
    {
      name: "ability",
      title: "Megazord's Ability",
      type: "text",
    },
  ],
};
