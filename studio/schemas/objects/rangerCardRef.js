import {
  GiCardRandom,
  GiPunchBlast,
  GiRapidshareArrow,
  GiRunningNinja,
} from "react-icons/gi";
import Tabs from "sanity-plugin-tabs";

export default {
  name: "rangerCardRef",
  type: "object",
  title: "Card",
  fields: [
    { title: "Card Title", name: "name", type: "string" },
    {
      name: "effects",
      type: "object",
      inputComponent: Tabs,

      fieldsets: [
        { name: "main", title: "Card Description", options: { sortOrder: 10 } },
        {
          name: "extra",
          title: "Extra Effect",
          options: { sortOrder: 20 },
        },
      ],
      options: {
        // setting layout to object will group the tab content in an object fieldset border.
        // ... Useful for when your tab is in between other fields inside a document.
        layout: "object",
      },

      fields: [
        {
          title: "Type",
          name: "type",
          type: "string",
          fieldset: "main",
          options: {
            list: [
              { title: "Attack", value: "attack" },
              { title: "Reaction", value: "reaction" },
              { title: "Maneuver", value: "maneuver" },
            ],
          },
        },
        {
          title: "Main Effect",
          name: "effect",
          type: "text",
          fieldset: "main",
        },

        {
          title: "Extra Effect Type",
          name: "extraType",
          type: "string",
          fieldset: "extra",
          options: {
            list: [
              { title: "Star", value: "star" },
              { title: "Gold", value: "gold" },
            ],
          },
        },
        {
          title: "Extra Effect",
          name: "extraEffect",
          type: "text",
          description: "This include effects like the Star ability",
          fieldset: "extra",
        },
      ],
    },

    {
      name: "cardInfo",
      type: "object",
      inputComponent: Tabs,
      fieldsets: [
        { name: "damage", title: "Damage", options: { sortOrder: 10 } },
        {
          name: "energy",
          title: "Energy",
          options: { sortOrder: 20 },
        },
        {
          name: "shields",
          title: "Shields",
          options: { sortOrder: 30 },
        },
      ],
      options: {
        // setting layout to object will group the tab content in an object fieldset border.
        // ... Useful for when your tab is in between other fields inside a document.
        layout: "object",
      },

      fields: [
        {
          title: "Special?",
          name: "special",
          type: "boolean",
          fieldset: "damage",
          initialValue: false,
        },
        {
          title: "Dice Damage",
          name: "dice",
          fieldset: "damage",
          type: "number",
        },
        {
          title: "Static Damage",
          name: "static",
          description: "Does not include damage from extra effects",
          fieldset: "damage",
          type: "number",
        },

        {
          title: "X?",
          name: "x",
          fieldset: "energy",
          type: "boolean",
          // initialValue: false,
        },
        { title: "Amount", name: "amount", fieldset: "energy", type: "number" },

        {
          title: "Shields",
          name: "shields",
          fieldset: "shields",
          type: "number",
        },
        {
          title: "Quanity/Copies",
          name: "quantity",
          fieldset: "shields",
          type: "number",
        },
      ],
    },

    // non tabs

    { title: "Effect", name: "desc", type: "text" },
    { title: "Extra Effect", name: "extraDesc", type: "text" },
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
        {
          title: "Special?",
          name: "special",
          type: "boolean",
        },
        { title: "Dice Damage", name: "dice", type: "number" },
        {
          title: "Static Damage",
          name: "static",
          description: "Does not include damage from extra effects",
          type: "number",
        },
      ],
    },
    {
      title: "Energy Cost",
      name: "cost",
      type: "object",
      fields: [
        { title: "X?", name: "x", type: "boolean" },
        { title: "Amount", name: "amount", type: "number" },
      ],
    },
    { title: "Shields", name: "shields", type: "number" },
    { title: "Quanity/Copies", name: "quantity", type: "number" },
  ],
  initialValue: {
    // damageInfo: { special: false, x: false },
    damage: { special: false },
    cost: { x: false },
  },
  preview: {
    select: {
      name: "name",
      effects: "effects",
      cardInfo: "cardInfo",
    },
    prepare(selection) {
      const { name, effects, cardInfo } = selection;
      let q = cardInfo.quantity > 1 ? ` x${cardInfo.quantity}` : "";
      let type = effects.type;
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
