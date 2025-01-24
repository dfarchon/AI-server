import express, { Request, Response, Router } from "express";
import fetch from "node-fetch"; // Ensure node-fetch is installed

import { predictTokenCost } from "./utils.js";

interface AgentResponse {
  aiResponse: {
    df_fcName: string;
    args: string[];
  };
  choices: { message: { role: string; content: string } }[];
  error?: { message: string };
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key in environment variables.");
}

const router: Router = express.Router();
const temperature = 0.2;
const max_completion_tokens = 1000;

async function callOpenAI(
  messages: any[],
  max_tokens: number
): Promise<AgentResponse> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      max_completion_tokens,
      temperature,
    }),
  });

  const data = (await response.json()) as AgentResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to fetch from OpenAI.");
  }

  return data;
}

// async function callAssitantAI(
//   messages: any[],
//   max_tokens: number
// ): Promise<AgentResponse> {
//   const response = await fetch("https://api.openai.com/v1/assistants", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${OPENAI_API_KEY}`,
//       "OpenAI-Beta": `assistants=v2`,
//     },
//     body: JSON.stringify({
//       model: "gpt-3.5-turbo",
//       messages,
//       max_tokens,
//       max_completion_tokens,
//       temperature,
//     }),
//   });

//   const data = (await response.json()) as AgentResponse;
//   if (!response.ok) {
//     throw new Error(data.error?.message || "Failed to fetch from OpenAI.");
//   }

//   return data;
// }

router.post("/agent", async (req: Request, res: Response) => {
  try {
    const { username, ownerAddress, message, selectedPlanets } = req.body;

    if (!username || typeof username !== "string") {
      res.status(400).json({ error: "Invalid username. Must be a string." });
      return;
    }

    if (!ownerAddress || typeof ownerAddress !== "string") {
      res
        .status(400)
        .json({ error: "Invalid ownerAddress. Must be a string." });
      return;
    }

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Invalid message. Must be a string." });
      return;
    }

    if (!selectedPlanets || typeof selectedPlanets !== "string") {
      res
        .status(400)
        .json({ error: "Invalid selectedPlanets. Must be a string." });
      return;
    }
    console.log("username:", username);
    console.log("selectedPlanets:", selectedPlanets);
    console.log("msg:", message);

    const prompt = `
    You are Sophon, an AI agent assisting in the Dark Forest game using PlayerFunctions for the Dark Forest MUD. Your goal is to analyze the player's selectedPlanets, generate commands, and maintain strict adherence to the game's mechanics, functions, and data formats.
    
    ---
    ### Game Definitions
    1. **PlanetStatus**: ["DEFAULT", "DESTROYED"]
    2. **PlanetType**:
      - "1": "PLANET: Generates energy; only upgradable."
      - "2": "ASTEROID_FIELD: Generates energy and silver; best to explore."
      - "3": "FOUNDRY: Generates energy, prospects for artifacts."
      - "4": "SPACETIME_RIP: Generates energy, withdraw artifacts to wallet, withdraw silver for score; best to explore."
      - "5": "QUASAR: Longest range, no generation."
    3. **PlanetLevel**: {0, 1, 2, 3, 4, 5, 6, 7, 8, 9}
    4. **PlanetBoost**:
      - "DEFENSE": "Doubles defense."
      - "RANGE": "Increases range."
      - "SPEED": "Boosts movement."
      - "POPULATION_GROWTH": "Speeds recharge (excludes Quasar)."
      - "SILVER_GROWTH": "Faster silver production (Asteroids only)."
    5. **UpgradeBranch**:
      - "0": "Defense"
      - "1": "Range"
      - "2": "Speed"
    6. **SpaceType**:
      - "NEBULA": "Max level 4; upgrades: 3."
      - "SPACE": "Max level 5; upgrades: 4."
      - "DEEP_SPACE": "Max level 9; upgrades: 5."
      - "DEAD_SPACE": "Corrupted biomes only; max level 9; upgrades: 5."
    7. **Biome**:
      - "OCEAN", "FOREST", "GRASSLAND", "TUNDRA",
        "SWAMP", "DESERT", "ICE", "WASTELAND",
        "LAVA", "CORRUPTED"
    8. **ArtifactStatus**: ["DEFAULT", "COOLDOWN", "CHARGING", "READY", "ACTIVE", "BROKEN"]
    9. **ArtifactGenre**: ["DEFENSIVE", "OFFENSIVE", "PRODUCTIVE", "GENERAL"]
    10. **ArtifactRarity**: ["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"]
    11. **ArtifactTypes**:
        - "BloomFilter": "Refills planet energy."
        - "Wormhole": "Portal between two planets; Nearly instant travel light speed limits."
        - "PhotoidCannon": "Fires a beam at a planet; reduces defense while charging. Fast nearly as light speed."
        - "Bomb": "Drops a bomb creating a pink circle; consumed on use."
    12. **GameRadius**: 150,000 (Game area radius)

    ---
    ### Selected Planets
    prediction.Content:
    You can only control planets owned by the player (\`planet.owner = ${ownerAddress}\`). The \`selectedPlanets = ${selectedPlanets}\` are structured as follows:
    - \`planet.locationId\`: Unique planet identifier.
    - \`planet.name\`: Name of the planet.
    - \`planet.isHomePlanet\`: Whether the planet is a home planet (true/false).
    - \`planet.owner\`: Planet owner (use "0x0" for "0x0000000000000000000000000000000000000000").
    - \`planet.ownerName\`: Owner's name.
    - \`planet.spaceType\`: Type of space (e.g., NEBULA, SPACE, DEEP_SPACE).
    - \`planet.planetType\`: Planet type (e.g., PLANET, ASTEROID_FIELD).
    - \`planet.planetLevel\`: Planet level.
    - \`planet.universeZone\`: Universe zone.
    - \`planet.distSquare\`: Distance from center.
    - \`planet.range\`: Planet range.
    - \`planet.speed\`: Speed of movement from the planet.
    - \`planet.defense\`: Defense of the planet.
    - \`planet.energy\`: Current energy of the planet.
    - \`planet.energyCap\`: Maximum energy capacity.
    - \`planet.energyGrowth\`: Grow energy per 1 second.
    - \`planet.silver\`: Current silver held.
    - \`planet.silverCap\`: Maximum silver capacity.
    - \`planet.silverGrowth\`: Grow silver per 1 second.
    - \`planet.upgradeState\`: The upgrade state.
    - \`planet.coordsRevealed\`: Coords are revealed on worldmap.
    - \`planet.bonus\`: Planet bonus map from upgrades.
    - \`planet.energyGroDoublers\`: Planet bonus energy Growth Doublers. 
    - \`planet.silverGroDoublers\`: Planet bonus silver Growth Doublers. 
    - \`planet.hasTriedFindingArtifact\`: Artifact is was started to prospect. 
    - \`planet.heldArtifactIds\`:  Artifact is possible to prospect and find. 
    - \`planet.destroyed\`:  The Planet is destroyed. 
    - \`planet.effects\`:  The Planet current effects. 
    - \`planet.flags\`:  The Planet current flags. 
    - \`planet.transactions\`:  The Planet current transactions. 
    - \`planet.location.coords.x\`: X-coordinate.
    - \`planet.location.coords.y\`: Y-coordinate.
    - \`planet.biome\`: The Planet biome type.
    ---
    The available PlayerFunctions are defined below. You must fill and follow all specified arguments and their requirements exactly as described:

    ### PlayerFunctions
    your tools
    1. **move**
      - **Description:** Move energy from one planet to another. Words like send , attack , transfer
      - **Arguments:**
        - \`from\`: \`LocationId\` (Source planet's locationId)
        - \`to\`: \`LocationId\` (Destination planet's locationId)
        - \`forces\`: \`number\` (MUST BE Energy for the move, calculate value as result from \`getEnergyNeededForMove\` and add some overflow energy. You can use min 5% and max 99% fromId.energy, never put 0)
        - \`silver\`: \`number\` (Amount of silver to transfer; default is 0 if not specified; you can use only 0-99% of fromId.silver)
        - \`artifactMoved\`: \`ArtifactId\` (Optional; defaults to \`null\`)
        - \`abandoning\`: \`boolean\` (Default: \`false\`)
      - **strict**

    2. **revealLocation**
      - **Description:** Reveal the details of a specific planet's location.
      - **Arguments:**
        - \`locationId\`: \`LocationId\` (The planet's locationId to reveal)

    3. **upgradePlanet**
      - **Description:** Upgrade a planetType = 1 only to improve its capabilities.
      - **Arguments:**
        - \`planet\`: \`LocationId\` (The planet's locationId to upgrade)
        - \`branch\`: \`number\` (The upgrade branch; valid values are:
            - \`0\`: Defense
            - \`1\`: Range
            - \`2\`: Speed)

    4. **withdrawSilver**
      - **Description:** Withdraw silver from a planet. This function is only available for planets of type \`Space Rip\` (\`planet.planetType = 4\`).
      - **Arguments:**
        - \`locationId\`: \`LocationId\` (The planet's locationId)
        - \`amount\`: \`number\` (The amount of silver to withdraw)

    ---
    The available helper functions allow you to calculate distances between planets using their planet.location.coords and predict the energy required for movement, ensuring each move is properly validated and efficient:
    
    ### Helper Functions
    your prediction tools
    
    1. **Calculate Distance:**
      \`\`\`
      getDistCoords(fromCoords, toCoords) {
        return Math.sqrt(
          (fromCoords.x - toCoords.x) ** 2 + (fromCoords.y - toCoords.y) ** 2
        );
      }
      \`\`\`

    2. **Calculate Energy for Movement:**
      \`\`\`
      getEnergyNeededForMove(fromId, toId, arrivingEnergy, abandoning = false) {
        const from = this.getPlanetWithId(fromId);
        const upgradedPlanet = {
          ...from,
          range: (from.range * upgrade.rangeMultiplier) / 100,
          energyCap: (from.energyCap * upgrade.energyCapMultiplier) / 100,
        };
        const dist = this.getDistCoords(fromId, toId);
        const range = upgradedPlanet.range * this.getRangeBuff(abandoning);
        const rangeSteps = dist / range;

        const arrivingProp = arrivingEnergy / upgradedPlanet.energyCap + 0.05;

        return arrivingProp * Math.pow(2, rangeSteps) * upgradedPlanet.energyCap;
      }
      \`\`\`

    3. **Calculate Time for Movement:**
      \`\`\`
      getTimeForMove(fromId, toId, abandoning = false) {
        const from = this.getPlanetWithId(fromId);
        const dist = this.getDistCoords(fromId, toId);
        const speed = from.speed * this.getSpeedBuff(abandoning);
        return dist / (speed / 100) / this.getCurrentTickerRate();
      }
      \`\`\`

    ---

    ### Rules and Constraints
    1. Use \`planet.locationId\` for references, not \`planet.name\`.
    2. Format energy and silver as \`.toFixed(0)\`.
    3. Default values:
      - Silver: 0
      - Artifact ID: null
      - Abandoning: false
    4. For best explore startegy use first closest Asteroid Fields and SpaceTime rips accodinr planet.planetTypes.
    5. You can use for move only maximum fromId.planet.energy and fromId.planet.silver
    6. For each move you predict argument energy with helper function getEnergyNeededForMove(fromId, toId, arrivingEnergy, abandoning = false) arriving energy is overflow 
    7. Each move can use only 6% - 99% of planet.energy
    8. Asteroid Field any time trying distribute silver to PLANET and Spacetime Rip maximum to.planet.silverCap
    9. All words move , send , attack , transfere , deliver are for function move
    10. Ensure arguments align with function requirement input formats.
    ---
    
    ### Response Format
    Respond in the following JSON format:
    \`\`\`
    {
      "df_fcName": "FunctionName",
      "args": ["arg1", "arg2", "..."]
    }
    \`\`\`
    
    ### Example Input and Output
    **Input:** "Move energy from the closest planet to defend a target planet."
    **Output:**
    \`\`\`
    {
      "df_fcName": "df.move",
      "args": ["fromId", "toId", "energy", "silver", "artifactId", "abandoning"]
    }
    \`\`\`
    ---
    
    Follow these instructions precisely to generate consistent and actionable commands 3 times check your response.
    `;

    const messages = [
      { role: "system", content: prompt },
      { role: "user", content: `Request: ${message}` },
    ];
    const cost = predictTokenCost(JSON.stringify(messages), "gpt-3.5-turbo");
    console.log("Cost for agent request:", cost.cost, "tokens:", cost.tokens);
    const aiResponse = await callOpenAI(messages, 200);

    const content = aiResponse.choices[0]?.message?.content;

    if (!content) {
      res.status(500).json({ error: "AI response was empty or invalid." });
      return;
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      res.status(500).json({
        error: "Failed to parse AI response. Ensure AI returns valid JSON.",
      });
      return;
    }

    res.json({
      success: true,
      username,
      message,
      aiResponse: parsedContent,
    });
    console.log(username, message, parsedContent);
  } catch (error: any) {
    console.error("Error in /agent endpoint:", error.message);
    res.status(500).json({
      error: error.message || "An internal server Agent error occurred.",
    });
  }
});

export default router;
