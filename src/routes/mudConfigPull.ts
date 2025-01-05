import { execSync } from "child_process";
import path from "path";

// Function to pull and load the configuration
export async function getMudConfig(): Promise<any> {
  // Dynamically import the mud.config.ts file
  try {
    const mudConfigPath = path.resolve("../../mud.config.ts");
    const defineWorld = await import(mudConfigPath);
    console.log("is MUD>", defineWorld);
  } catch (error) {
    console.log("MUD Pull started");
    try {
      // Execute mud pull command
      execSync(
        `mud pull --worldAddress ${process.env.MUD_CONTRACT_ADDRESS} --rpc ${process.env.MUD_RPC_URL} --replace`,
        { stdio: "inherit" } // Log output to console
      );

      console.log("mud pull completed.");
      debugger;
      const mudConfigPath = path.resolve("../../mud.config.ts");
      const defineWorld = await import(mudConfigPath);
      console.log("MUD Configuration Loaded:", defineWorld);

      return defineWorld;
    } catch (error) {
      console.error("Error pulling MUD configuration:", error);
      throw new Error("Failed to pull MUD configuration.");
    }
  }
}
