
export const OPENAI_BASE_URL = "https://api.openai.com";
export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/";
export const MOONSHOT_BASE_URL = "https://api.moonshot.cn";
export const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export const CACHE_URL_PREFIX = "/api/cache";
export const UPLOAD_URL = `${CACHE_URL_PREFIX}/upload`;


export const REQUEST_TIMEOUT_MS = 60000;

export enum ApiPath {
  Cors = "",
  OpenAI = "/api/openai",
  Google = "/api/google",
  Moonshot = "/api/moonshot",
  DeepSeek = "/api/deepseek",
}
export const OpenaiPath = {
  ChatPath: "v1/chat/completions",
  SpeechPath: "v1/audio/speech",
  ImagePath: "v1/images/generations",
  UsagePath: "dashboard/billing/usage",
  SubsPath: "dashboard/billing/subscription",
  ListModelPath: "v1/models",
};

export const Google = {
  ExampleEndpoint: "https://generativelanguage.googleapis.com/",
  ChatPath: (modelName: string) =>
    `v1beta/models/${modelName}:streamGenerateContent`,
};

export const DeepSeek = {
  ExampleEndpoint: DEEPSEEK_BASE_URL,
  ChatPath: "chat/completions",
};
