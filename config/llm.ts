const providerModelMap: Record<string, Record<string, any>> = {
  deepseek: {
    "deepseek-chat": {
      endpoint: "https://api.deepseek.com/chat/completions",
      apiKey: process.env.API_KEY,
    },
  },
  gemini: {
    "gemini-1.5-pro-latest": {
      endpoint: "https://gemini.larc.top/v1/chat/completions",
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
};

export function getProviderConfig(provider: string, model: string) {
  return providerModelMap[provider]?.[model];
}
