# Cosmo Tarot ✨

Interactive tarot for reflection & inspiration. A ChatGPT-native tarot/Lenormand reading app built with Next.js 15, TypeScript, and the OpenAI Apps SDK.

## Features

- **Ritual-based UX**: Enforced sequence (shuffle → pick → reveal → meaning) with strict gating
- **Lenormand-style interpretation**: Cards interpreted as a combined sequence, not individually
- **Cosmic context**: Template-based daily descriptors and metaphors
- **Share-ready**: Screenshot-ready HTML share cards + copy-to-clipboard
- **MCP integration**: Single tool for ChatGPT to retrieve readings
- **Deterministic state**: Refresh-safe with drawId-based session management

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- OpenAI API (for reading generation)
- Model Context Protocol (MCP) for ChatGPT integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional, falls back to template-based readings)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (optional):
   ```bash
   # .env.local
   OPENAI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### MCP Server

To run the MCP server for ChatGPT integration:

```bash
npm run mcp
```

The MCP server exposes a single tool: `cosmo_tarot_reading({ drawId, locale? })` that retrieves completed readings.

Configure the MCP server in your ChatGPT settings to point to this server.

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    page.tsx              # Landing page
    reading/
      input/              # Input page (name, question, spread)
      ritual/[drawId]/    # Ritual page (shuffle, pick, reveal)
      result/[drawId]/    # Reading page (4 paginated pages)
    api/                  # API routes
      draws/              # Draw management endpoints
  lib/
    types.ts              # Core TypeScript types
    decks/                # Lenormand deck data
    engine/               # Deck shuffling and state logic
    cosmic/               # Cosmic context system
    ai/                   # LLM reading generator
    store/                # In-memory draw store (v0)
  components/
    ui/                   # Reusable UI components

mcp/
  server.ts               # MCP server for ChatGPT integration
```

## Architecture

### State Management

- Each reading session has a unique `drawId` generated server-side
- Server is authoritative for deck order, selections, and reveal state
- Draws expire after 24 hours (TTL)
- Refresh-safe: users can resume current draw via drawId

### Reading Generation

- Exactly one LLM call per completed reading
- Lenormand-style: cards interpreted as a sequence, not individually
- 4-page structure: Frame & Theme, Sequence Unfolding, Implications & Tension, Interpretation & Direction
- Falls back to template-based readings if OpenAI API is unavailable

### Cosmic Context

- Template-based system (366 daily templates)
- Deterministic mapping: day-of-year → descriptor + metaphor
- Zodiac integration (optional)
- Decorative/evocative only (no predictive claims)

## API Endpoints

- `POST /api/draws/start` - Start a new reading
- `GET /api/draws/[drawId]` - Get draw state
- `POST /api/draws/[drawId]/shuffle` - Shuffle deck
- `POST /api/draws/[drawId]/select` - Select/deselect a card
- `POST /api/draws/[drawId]/reveal` - Reveal a card
- `POST /api/draws/[drawId]/complete` - Generate reading (one LLM call)
- `GET /api/draws/[drawId]/reading` - Get completed reading

## Safety & Compliance

- Always shows disclaimer on reading page and share artifact
- No medical/legal/financial directives
- No guarantees/predictions
- Uses interpretive language ("suggests", "indicates", "points to")

## v1 Extensions (Deferred)

- User accounts + reading history
- Saved images + share links
- Social integrations
- Paid credits / premium spreads
- Live cosmic/ephemeris API

## License

MIT
