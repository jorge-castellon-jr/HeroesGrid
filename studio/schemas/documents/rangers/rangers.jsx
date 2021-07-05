import { GiRobotLeg } from "react-icons/gi";
import { BsPeopleCircle } from "react-icons/bs";
import sanityClient from "part:@sanity/base/client";
import React from "react";

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
          { title: "Silver", value: "#a0aec0" },
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
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: (doc) => {
          const query = `{
            "team": *[_id=="${doc.team._ref}"][0] { 'slug': slug.current },
            "expansion": *[_id=="${doc.expansion._ref}"][0] { "slug": slug.current }
          }`;
          return sanityClient
            .fetch(query)
            .then(
              (res) => {
                return `${res.team.slug}-${doc.color.title}-${res.expansion.slug}`}
            );
        },
      },
    },

    {
      name: "teamPosition",
      title: "Team Position",
      type: "slug",
      options: {
        source: (doc) => {
          const query = `*[_id=="${doc.team._ref}"][0] { season }`;
          return sanityClient
            .fetch(query)
            .then(
              (res) => {
                console.log(res);
                return `${res.season} ${doc.color.title}`}
            );
        },
        slugify: (input) => input,
      },
    },
    {
      name: "order",
      title: "Ranger's Order",
      type: "number",
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
          type: "rangerCardRef",
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
      of: [{
        type: "reference",
        to: [{ type: "zord" }],
      }],
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
      team: "teamPosition.current",
      color: "color",
      image: "image",
    },
    prepare({ title, color, team, image }) {
      let teamTitle = team[0] == '*' ? team.replace(/\*/g, '') : `${team.replace(/-/g, '')} Ranger`
      let imgURL = image ? `https://cdn.sanity.io/images/8cmhkwlo/production/${image.asset._ref.replace(/image-/i, '').replace(/-png/i,'')}.png?w=40&amp;h=40&amp;fit=crop`: ''
      return {
        title: `${title}`,
        subtitle:  teamTitle,
        media: image
          ? <span style={{backgroundImage: `url(${imgURL})`,backgroundColor: color.value, borderRadius: 100, height: 40, width: 40}}></span>
          : <span style={{backgroundColor: color.value, borderRadius: 100, height: 40, width: 40}}></span>,
      };
    },
  },
};
