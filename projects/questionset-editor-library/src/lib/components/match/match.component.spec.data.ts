export const mockOptionData = {
  editorOptionData: {
    question: "<p>Match the following with appropriate answer?</p>",
    options: [
      {
        left: "<p>Lotus</p>",
        right: "<p>Flower</p>",
      },
      {
        left: "<p>Mango</p>",
        right: "<p>Fruit</p>",
      },
    ],
    templateId: "mtf-vertical",
    correctMatchPair: [{ "0": 0 }, { "1": 1 }],
    numberOfOptions: 4,
  },
  prepareMtfBody: {
    templateId: "mtf-horizontal",
    name: "Match The Following Question",
    responseDeclaration: {
      response1: {
        cardinality: "multiple",
        type: "map",
        correctResponse: {
          value: [
            {
              "0": 0,
            },
            {
              "1": 1,
            },
          ],
        },
        mapping: [
          {
            value: {
              "0": 0,
            },
            score: 2,
          },
          {
            value: {
              "1": 1,
            },
            score: 2,
          },
        ],
      },
    },
    interactionTypes: ["match"],
    interactions: {
      response1: {
        type: "match",
        options: {
          left: [
            {
              label: "<p>Lotus</p>",
              value: 0,
            },
            {
              label: "<p>Mango</p>",
              value: 1,
            },
          ],
          right: [
            {
              label: "<p>Flower</p>",
              value: 0,
            },
            {
              label: "<p>Fruit</p>",
              value: 1,
            },
          ],
        },
      },
    },
    editorState: {
      options: {
        left: [
          {
            value: {
              body: "<p>Lotus</p>",
              value: 0,
            },
          },
          {
            value: {
              body: "<p>Mango</p>",
              value: 1,
            },
          },
        ],
        right: [
          {
            value: {
              body: "<p>Flower</p>",
              value: 0,
            },
          },
          {
            value: {
              body: "<p>Fruit</p>",
              value: 1,
            },
          },
        ],
      },
    },
    qType: "MTF",
    primaryCategory: "Match The Following Question",
  },
};
