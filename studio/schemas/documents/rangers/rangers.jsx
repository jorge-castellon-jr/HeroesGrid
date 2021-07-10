import { GiRobotLeg } from "react-icons/gi";
import { BsPeopleCircle } from "react-icons/bs";
import sanityClient from "part:@sanity/base/client";
import React from "react";
import Tabs from "sanity-plugin-tabs";

export default {
  name: "ranger",
  title: "Rangers",
  icon: BsPeopleCircle,
  type: "document",
  fields: [
    {
      name: "name",
      title: "Ranger's Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },

    {
      name: "rangerInfo",
      type: "object",
      inputComponent: Tabs,
      fieldsets: [
        { name: "ranger", title: "Ranger Info", options: { sortOrder: 10 } },
        {
          name: "expansion",
          title: "Expansion Info",
          options: { sortOrder: 20 },
        },
        { name: "meta", title: "Meta", options: { sortOrder: 30 } },
      ],
      options: {
        layout: "object",
      },

      fields: [
        {
          name: "color",
          title: "Ranger's Color",
          type: "colorlist", // required
          fieldset: "ranger",
          validation: (Rule) => Rule.required(),
          options: {
            list: [
              { title: "Red", value: "#EF4444" },
              { title: "Blue", value: "#60A5FA" },
              { title: "Black", value: "#1a202c" },
              { title: "Yellow", value: "#f6e05e" },
              { title: "Pink", value: "#ed64a6" },
              { title: "Green", value: "#48bb78" },
              { title: "White", value: "#f7fafc" },
              { title: "Silver", value: "#a0aec0" },
              { title: "Gold", value: "#D97706" },
              { title: "Crimson", value: "#991B1B" },
              { title: "Purple", value: "#805ad5" },
              { title: "Orange", value: "#f6ad55" },
              { title: "Shadow", value: "#7DD3FC" },
            ],
          },
        },
        {
          name: "team",
          title: "Ranger's Team",
          type: "reference",
          fieldset: "ranger",
          validation: (Rule) => Rule.required(),
          to: [{ type: "team" }],
        },
        {
          name: "teamPosition",
          title: "Team Position Title",
          description: "Official Team position title",
          fieldset: "ranger",
          type: "slug",
          validation: (Rule) => Rule.required(),
          options: {
            source: (doc) => {
              const query = `*[_id=="${doc.team._ref}"][0] { name }`;
              return sanityClient.fetch(query).then((res) => {
                return `${res.name} ${doc.color.title}`;
              });
            },
            slugify: (input) => input,
          },
        },
        {
          name: "order",
          title: "Ranger's Order",
          type: "number",
          description:
            "The order in the team position. i.e. Lead rangers are 1, while Extra or 6th rangers are last",
          fieldset: "ranger",
        },

        {
          title: "Exclusive?",
          name: "exclusive",
          type: "boolean",
          fieldset: "expansion",
        },
        {
          name: "expansion",
          title: "Release",
          type: "reference",
          fieldset: "expansion",
          validation: (Rule) => Rule.required(),
          to: [{ type: "expansion" }],
        },

        {
          name: "slug",
          title: "Slug",
          type: "slug",
          fieldset: "meta",
          validation: (Rule) => Rule.required(),
          description:
            "Ranger Team and Expansion need to be selected prior to using the generate button.",
          options: {
            source: (doc) => {
              const query = `{
            "team": *[_id=="${doc.team._ref}"][0] { 'slug': slug.current },
            "expansion": *[_id=="${doc.expansion._ref}"][0] { "slug": slug.current }
          }`;
              return sanityClient.fetch(query).then((res) => {
                return `${res.team.slug}-${doc.color.title}-${res.expansion.slug}`;
              });
            },
          },
        },
      ],
    },

    {
      name: "rangerCards",
      type: "object",
      inputComponent: Tabs,
      fieldsets: [
        { name: "ranger", title: "Ability Card", options: { sortOrder: 10 } },
        { name: "deck", title: "Deck", options: { sortOrder: 20 } },
        { name: "zords", title: "Zords", options: { sortOrder: 30 } },
        { name: "analysis", title: "Analysis", options: { sortOrder: 40 } },
      ],
      options: {
        // setting layout to object will group the tab content in an object fieldset border.
        // ... Useful for when your tab is in between other fields inside a document.
        layout: "object",
      },

      fields: [
        {
          name: "image",
          title: "Teams's Image",
          type: "image",
          fieldset: "ranger",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "abilityName",
          title: "Ranger's Ability",
          type: "string",
          fieldset: "ranger",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "abilityDesc",
          title: "Ranger's Ability Description",
          type: "text",
          fieldset: "ranger",
          validation: (Rule) => Rule.required(),
        },

        {
          name: "deck",
          title: "Ranger's Deck",
          type: "array",
          fieldset: "deck",
          options: {
            // editModal: "popover",
          },
          of: [
            {
              name: "card",
              title: "Card",
              type: "rangerCardRef",
            },
          ],
        },

        {
          name: "zords",
          title: "Ranger's Zord(s)",
          type: "array",
          fieldset: "zords",
          options: {
            editModal: "popover",
          },
          of: [
            {
              type: "reference",
              to: [{ type: "zord" }],
            },
          ],
        },

        {
          name: "combatType",
          title: "Ranger's Combat Type",
          type: "string",
          fieldset: "analysis",
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
          fieldset: "analysis",
          options: {
            list: [
              { title: "Combat", value: "combat" },
              { title: "Support", value: "support" },
              { title: "Energy", value: "energy" },
            ],
          },
        },
      ],
    },
  ],
  orderings: [
    {
      title: "Name, Asc",
      name: "name",
      by: [{ field: "name", direction: "asc" }],
    },
    {
      title: "Name, Desc",
      name: "name",
      by: [{ field: "name", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      team: "rangerInfo.teamPosition.current",
      color: "rangerInfo.color",
      image: "rangerCards.image",
    },
    prepare({ title, color, team, image }) {
      let teamTitle =
        team[0] == "*"
          ? team.replace(/\*/g, "")
          : `${team.replace(/-/g, "")} Ranger`;
      let imgURL = image
        ? `https://cdn.sanity.io/images/8cmhkwlo/production/${image.asset._ref
            .replace(/image-/i, "")
            .replace(/-png/i, "")}.png?w=40&amp;h=40&amp;fit=crop`
        : "";
      return {
        title: `${title}`,
        subtitle: teamTitle,
        media: image ? (
          <span
            style={{
              backgroundImage: `url(${imgURL})`,
              backgroundColor: color.value,
              borderRadius: 100,
              height: 40,
              width: 40,
            }}
          ></span>
        ) : (
          <span
            style={{
              backgroundColor: color.value,
              borderRadius: 100,
              height: 40,
              width: 40,
            }}
          ></span>
        ),
      };
    },
  },
};
