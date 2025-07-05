export const AIChatGameConfig = `
{
  "PlanetStatus": ["DEFAULT", "DESTROYED"],
  "PlanetType": {
    "PLANET": "Generates energy; upgradable.",
    "ASTEROID_FIELD": "Generates energy and silver; not upgradable; best to explore.",
    "FOUNDRY": "Generates energy, prospect and finds artifacts; not upgradable.",
    "SPACETIME_RIP": "Generates energy, stakes artifacts, burns silver; not upgradable; best to explore.",
    "QUASAR": "Longest range, no generation; not upgradable."
  },
  "SpaceType": {
    "NEBULA": "Max level 4; upgrades: 3.",
    "SPACE": "Max level 5; upgrades: 4.",
    "DEEP_SPACE": "Max level 9; upgrades: 5.",
    "DEAD_SPACE": "Corrupted biomes only; max level 9; upgrades: 5."
  },
  "Biome": [
    "OCEAN", "FOREST", "GRASSLAND", "TUNDRA",
    "SWAMP", "DESERT", "ICE", "WASTELAND",
    "LAVA", "CORRUPTED"
  ],
  "ArtifactStatus": ["DEFAULT", "COOLDOWN", "CHARGING", "READY", "ACTIVE", "BROKEN"],
  "ArtifactGenre": ["DEFENSIVE", "OFFENSIVE", "PRODUCTIVE", "GENERAL"],
  "ArtifactRarity": ["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"],
  "PlanetBoost": {
    "DEFENSE": "Doubles defense.",
    "RANGE": "Increases range.",
    "SPEED": "Boosts movement.",
    "POPULATION_GROWTH": "Speeds recharge (excludes Quasar).",
    "SILVER_GROWTH": "Faster silver production (Asteroids only)."
  },
  "GameRadius": 150000,
  "PlanetLevel": { "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9 },
  "ArtifactTypes": {
    "BloomFilter": "Refills planet energy.",
    "Wormhole": "Portal between two planets; Nearly instant travel light speed limits.",
    "PhotoidCannon": "Fires a beam at a planet; reduces defense while charging. Fast nearly as light speed.",
    "PlanetaryShield": "Defends against BlackDomain.",
    "BlackDomain": "Targets planets of equal/higher level; countered by PlanetaryShield.",
    "IceLink": "Connects to planets with FireLink.",
    "FireLink": "Cancels IceLink; disappears after activation.",
    "Kardashev": "Used for Kardashev operations; reusable.",
    "Bomb": "Drops a bomb creating a pink circle; consumed on use.",
    "StellarShield": "Resists attacks and prevents pink destruction.",
    "Avatar": "Custom planet avatars.",
  },
  "GuildSystem": {
    "CreateFee": "0.00001 ETH",
    "MaxMembers": 5,
    "Cooldown": "4 hours",
    "Status": ["UNEXIST", "ACTIVE", "DISBANDED"],
    "Role": ["NONE", "MEMBER", "OFFICER", "LEADER"],
    "Description": "Allow delegation if:The sender is the burner address of the delegator, OR The sender's main address and delegator are in the same guild and has granted delegation for specific Guild Roles"
  },
  "HotKeys": [
    { "key": "n", "action": "Toggle terminal." },
    { "key": "m", "action": "Toggle screen panes." },
    { "key": ",", "action": "Toggle hotkey pane." },
    { "key": "g", "action": "Access shop." },
    { "key": "p", "action": "Toggle wallet pane." },
    { "key": "h", "action": "Open help pane." },
    { "key": "j", "action": "Access settings." },
    { "key": "k", "action": "Open plugins pane." },
    { "key": "l", "action": "View artifacts." },
    { "key": ";", "action": "Access planets pane." },
    { "key": "'", "action": "Open transactions pane." },
    { "key": "i", "action": "Diagnostics pane." }
  ],
  "ContractFunctions": {
    "AdminFunctions": [
      { "name": "pause", "description": "Pause the game contract." },
      { "name": "unpause", "description": "Unpause the game contract." },
      { "name": "updateTickRate", "description": "Adjust tick rate." },
      { "name": "initializePlayer", "description": "Initialize a new player." }
    ],
    "PlayerFunctions": [
      {
        "name": "move",
        "description": "Move a player or unit.",
        "arguments": {
          "from": "LocationId",
          "to": "LocationId",
          "forces": "number",
          "silver": "number",
          "artifactMoved": "ArtifactId (optional)",
          "abandoning": "boolean (default: false)"
        }
      },
      {
        "name": "revealLocation",
        "description": "Reveal planet location.",
        "arguments": {
          "locationId": "LocationId"
        }
      },
      {
        "name": "upgradePlanet",
        "description": "Upgrade a planet.",
        "arguments": {
          "planet": "LocationId",
          "branch": "number"
        }
      },
      {
        "name": "setPlanetEmoji",
        "description": "Assign custom emoji to planet.",
        "arguments": {
          "locationId": "LocationId",
          "emoji": "string"
        }
      },
      {
        "name": "withdrawSilver",
        "description": "Withdraw silver.",
        "arguments": {
          "locationId": "LocationId",
          "amount": "number"
        }
      }
    ]
  },
  "OtherHints": [
    { "action": "Move", "hint": "Click source planet, press 'q' or 'Send', then select destination. Ensure energy availability." },
    { "action": "SelectPlanet", "hint": "Click to view details like energy, silver, and level." },
    { "action": "ActivateArtifacts", "hint": "Choose artifact and activate. Ensure cooldowns are complete." },
    { "action": "FastExplore", "hint": "Use SpaceTime Rips and Asteroid Fields for rapid movement. Seek range and energy recharge boosts." },
    { "action": "UseHotkeys", "hint": "Refer to Hotkeys bar or press 'h' for help." },
    { "GameSystem": "ProspectAndFind", "hint": "Only on Space object Foundry you can prospect and after this find a new Artifacts. These Artifacts could be used in next round on same chain." },
    { "GameSystem": "Junk", "hint": "New Junk system aplied.Before a player can operate a conquered planet, they need to click “Add Junk.” This action adds the planet’s junk value to the player’s total. Each player has a junk limit, which ensures there is an upper bound on how many planets a player can effectively control. Players can also click “Clear Junk” to reduce their junk value, which will also result in giving up control of the corresponding planet. Player’s total junk limit: 15000 , PLANET_LEVEL_JUNK = [50, 55, 60, 65, 75, 100, 200, 250, 300, 500], Note 1: Even after another player conquers your planet, you can still click “Clear Junk” to reduce your junk value. Note 2: Before you click “Add Junk” after conquering a planet, the planet’s energy will not grow naturally.  " },
    { "Plugins": "Plugins could be dangerous please read before any use. They are also powerfull check https://dfares-plugins.netlify.app/. Do not forget about DF-explorer is here to speed up your Remote Explorer on additional GPU/CPU" },
    { "RoundSpecific": "New Dark Forest Comunnity Round start on 4.7.2025 ~3 weeks long within Artifacts and Guild system via MUD Framework for Universe DARK FOREST MUD v4 on r4.dfmud.xyz, EVM BASE chain , contract: 0x8ca92169D44a17857C88dDCde0FF1215d7C3E18A" },
    { "Reward": "Score is achieved within withdrawing silver per member for top 10 players. Pool is 260 USDC" },
    { "RewardGuilds": "Score is achieved within withdrawing silver per member of guild. Total silver amount per guild is result after End of round. Pool is 520 USDC" },
    { "RewardSocialMedia": "The social media bonus pool 200$ will be evenly distributed among these players who share game screenshots, leave comments, and tag @GamingOnBase @mud_dev @darkforest_mud on X!" },
    ]
}
`;
