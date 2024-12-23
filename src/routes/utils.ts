export const TOKEN_COSTS = {
  "gpt-3.5-turbo": 0.0015,
  "gpt-4": 0.03,
};

export function approximateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export function predictTokenCost(
  prompt: string,
  model: "gpt-3.5-turbo" | "gpt-4"
): { tokens: number; cost: number } {
  const tokens = approximateTokenCount(prompt);
  const costPerToken = TOKEN_COSTS[model] / 1000;
  const cost = tokens * costPerToken;
  return { tokens, cost };
}
