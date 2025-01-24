export const AIChatGameConfig = `
{
  "PlanetStatus": ["DEFAULT", "DESTROYED"],
  "PlanetType": {
    "PLANET": "Generates energy; upgradable; planet.planetType = 1",
    "ASTEROID_FIELD": "Generates energy and silver; not upgradable; best to explore; planet.planetType = 2",
    "FOUNDRY": "Generates energy, prospect and finds artifacts; not upgradable; planet.planetType = 3",
    "SPACETIME_RIP": "Generates energy, stakes artifacts, burns silver; not upgradable; best to explore; planet.planetType = 4.",
    "QUASAR": "Longest range, no generation; not upgradable; planet.planetType = 5."
  },
  "SpaceType": {
    "NEBULA": "Max level 4; upgrades: 3",
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
  "PlanetLevel": { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9},
  "ArtifactTypes": {
    "BloomFilter": "Refills planet energy.",
    "Wormhole": "Portal between two planets; Nearly instant travel light speed limits.",
    "PhotoidCannon": "Fires a beam at a planet; reduces defense while charging. Fast nearly as light speed.",
    "Bomb": "Drops a bomb creating a pink circle; consumed on use.",
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
    { "action": "ProspectAndFind", "hint": "Only on Space object Foundry you can prospect and after this find a new Artifacts" },
    { "Plugins": "Plugins could be dangerous please read before any use. They are also powerfull check https://dfares-plugins.netlify.app/. Do not forget about DF-explorer is here to speed up your Remote Explorer on additional GPU/CPU" },
    { "roundSpecific": "New Dark Forest Comunnity Round start on 29.12.2024 ~one week long within Artifacts and Guild system via MUD Framework for Universe DARK FOREST MUD v2 on dfmud.xyz, EVM Redstone chain , contract: 0x803a8182f2a2f0dabfd06c77c97d5703ce28d8e9" },
    { "RewardGuilds": "Score is achieved within withdrawing silver per member of guild. Total silver amount per guild is result after End of round. 1st = 500$ , 2nd = 300$, 3rd=200$, 4th-6th=100$, 7th-10th=50$" },
    { "RewardSocialMedia": "The social media bonus pool 500$ will be evenly distributed among these players who share game screenshots, leave comments, and tag @darkforest_eth @redstonexyz @mud_dev  @darkforest_mud on Twitter!" },
    ]
}
`;
