#!/usr/bin/env node
// MCP Server for Cosmo Tarot
// Exposes a single tool for retrieving readings by drawId

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// MCP server calls the Next.js API endpoints
// In production, set COSMO_TAROT_API_URL or defaults to http://localhost:3000
const API_BASE_URL =
  process.env.COSMO_TAROT_API_URL || "http://localhost:3000";

const SERVER_NAME = "cosmo-tarot";
const SERVER_VERSION = "0.1.0";

// Define the tool
const COSMO_TAROT_READING_TOOL: Tool = {
  name: "cosmo_tarot_reading",
  description:
    "Retrieves a completed Cosmo Tarot reading by drawId. Returns the full reading result including cards, interpretation pages, and share content. Use this when a user references a specific reading or wants to view/share their reading.",
  inputSchema: {
    type: "object",
    properties: {
      drawId: {
        type: "string",
        description:
          "The unique identifier for the tarot reading draw. Required.",
      },
      locale: {
        type: "string",
        description:
          "Optional locale code (e.g., 'en', 'es'). Defaults to 'en' if not provided.",
        default: "en",
      },
    },
    required: ["drawId"],
  },
};

async function main() {
  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [COSMO_TAROT_READING_TOOL],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "cosmo_tarot_reading") {
      const { drawId, locale = "en" } = args as {
        drawId: string;
        locale?: string;
      };

      if (!drawId) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "drawId is required",
                ready: false,
              }),
            },
          ],
          isError: true,
        };
      }

      try {
        // Fetch reading from Next.js API
        const response = await fetch(`${API_BASE_URL}/api/draws/${drawId}/reading`);
        
        if (!response.ok) {
          if (response.status === 404) {
            const errorData = await response.json();
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    error: errorData.error || "Reading not found or not ready",
                    ready: false,
                    drawId,
                    message:
                      "The reading for this draw has not been completed yet. The user needs to complete the ritual first.",
                  }),
                },
              ],
              isError: false,
            };
          }
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.ready || !data.reading) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Reading not yet generated",
                  ready: false,
                  drawId,
                  message:
                    "The reading for this draw has not been completed yet. The user needs to complete the ritual first.",
                }),
              },
            ],
            isError: false,
          };
        }

        // Return reading result
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ready: true,
                reading: {
                  meta: data.reading.meta,
                  input: data.reading.input,
                  draw: data.reading.draw,
                  pages: data.reading.pages,
                  share: data.reading.share,
                },
              }),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: `Failed to fetch reading: ${error instanceof Error ? error.message : String(error)}`,
                ready: false,
                drawId,
              }),
            },
          ],
          isError: true,
        };
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: `Unknown tool: ${name}`,
          }),
        },
      ],
      isError: true,
    };
  });

  // Connect to transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Cosmo Tarot MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in MCP server:", error);
  process.exit(1);
});
