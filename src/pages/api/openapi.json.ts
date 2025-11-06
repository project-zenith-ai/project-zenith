import type { NextApiRequest, NextApiResponse } from "next";

// OpenAPI spec for Project Zenith
const projectZenithSpec = {
  openapi: "3.0.0",
  info: {
    title: "Project Zenith API",
    version: "0.1.0",
    description: "AI content verification API",
  },
  paths: {
    "/api/check": {
      post: {
        summary: "Check if text is AI-generated",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { text: { type: "string" } },
                required: ["text"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "AI likelihood score",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { score: { type: "integer" } },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(projectZenithSpec);
}