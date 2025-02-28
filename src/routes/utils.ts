const TOKEN_COSTS: Record<
  "gpt-3.5-turbo" | "gpt-4" | "o3-mini",
  { input: number; output: number }
> = {
  "gpt-3.5-turbo": {
    input: 0.0015, // per 1,000 input tokens
    output: 0.002, // per 1,000 output tokens
  },
  "gpt-4": {
    input: 0.03, // per 1,000 input tokens
    output: 0.06, // per 1,000 output tokens
  },
  "o3-mini": {
    input: 0.0011, // per 1,000 input tokens
    output: 0.0044, // per 1,000 output tokens
  },
};

export function approximateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

// Predicts token cost based on model pricing
export function predictTokenCost(
  prompt: string,
  model: keyof typeof TOKEN_COSTS = "gpt-3.5-turbo"
) {
  const tokens = approximateTokenCount(prompt);
  const costPerToken = TOKEN_COSTS[model].input / 1000;
  const cost = tokens * costPerToken;

  return { tokens, cost };
}
