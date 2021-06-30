import { GiRobotLeg } from "react-icons/gi";
import sanityClient from "part:@sanity/base/client";
import React from "react";

export default {
  name: "ranger",
  title: "Rangers",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Ranger's Name",
      type: "string",
    },
    {
      name: "color",
      title: "Ranger's Color",
      type: "colorlist", // required
      options: {
        list: [
          { title: "Red", value: "#e53e3e" },
          { title: "Blue", value: "#4299e1" },
          { title: "Black", value: "#1a202c" },
          { title: "Yellow", value: "#f6e05e" },
          { title: "Pink", value: "#ed64a6" },
          { title: "Green", value: "#48bb78" },
          { title: "White", value: "#f7fafc" },
          { title: "Gray", value: "#a0aec0" },
          { title: "Purple", value: "#805ad5" },
          { title: "Orange", value: "#f6ad55" },
        ],
      },
    },
    {
      name: "team",
      title: "Ranger's Team",
      type: "reference",
      to: [{ type: "team" }],
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: (doc) => {
          console.log(doc);
          const query = `*[_id=="${doc.team._ref}"][0] { season }`;
          return sanityClient
            .fetch(query)
            .then(
              (res) =>
                `${res.season.replace(/\./g, "")}-${doc.color.title}${
                  doc.exclusive ? "-ex" : ""
                }`
            );
        },
      },
    },
    {
      name: "abilityName",
      title: "Ranger's Ability",
      type: "string",
    },
    {
      name: "abilityDesc",
      title: "Ranger's Ability Description",
      type: "text",
    },
    {
      name: "image",
      title: "Teams's Image",
      type: "image",
    },
    {
      name: "Deck",
      title: "Ranger's Deck",
      type: "array",
      options: {
        // editModal: "popover",
      },
      of: [
        {
          name: "card",
          title: "Card",
          type: "cardRef",
        },
      ],
    },
    {
      name: "zords",
      title: "Ranger's Zord(s)",
      type: "array",
      options: {
        editModal: "popover",
      },
      of: [
        {
          title: "Card",
          name: "card",
          type: "object",
          icon: GiRobotLeg,
          fields: [
            {
              name: "zord",
              title: "Zord Name",
              type: "string",
            },
            {
              name: "ability",
              title: "Zord Ability",
              type: "text",
            },
          ],
        },
      ],
    },

    {
      name: "expansion",
      title: "Release",
      type: "reference",
      to: [{ type: "expansion" }],
    },
    {
      title: "Exclusive?",
      name: "exclusive",
      type: "boolean",
    },

    {
      name: "combatType",
      title: "Ranger's Combat Type",
      type: "string",
      options: {
        list: [
          { title: "Combat", value: "combat" },
          { title: "Support", value: "support" },
          { title: "Energy", value: "energy" },
        ],
      },
    },
    {
      name: "mapType",
      title: "Ranger's Map Type",
      type: "string",
      options: {
        list: [
          { title: "Combat", value: "combat" },
          { title: "Support", value: "support" },
          { title: "Energy", value: "energy" },
        ],
      },
    },

    // {
    //   name: "mainImage",
    //   title: "Main image",
    //   type: "image",
    //   options: {
    //     hotspot: true,
    //   },
    // },
    // {
    //   name: "body",
    //   title: "Body",
    //   type: "blockContent",
    // },
  ],
  initialValue: {
    exclusive: false,
  },
  preview: {
    select: {
      title: "name",
      color: "color",
      team: "team.season",
      image: "image",
    },
    prepare({ title, color, team, image }) {
      console.log(image);
      return {
        title: title,
        subtitle: `${team} ${color.title} Ranger`,
        media: image
          ? image
          : <span style={{background: color.value, borderRadius: 100, height: 40, width: 40}}></span>,
      };
    },
  },
};
