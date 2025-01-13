import { DeepSeekApi } from "./platforms/deepseek";
import { GeminiProApi } from "./platforms/gemini";

import { ModelProvider, ServiceProvider } from "@/consts/constant";
import { LLMApi } from "@/types/llm";

export class ClientApi {
  public llm: LLMApi;

  constructor(provider: ModelProvider = ModelProvider.GPT) {
    switch (provider) {
      case ModelProvider.GeminiPro:
        this.llm = new GeminiProApi();
        break;
      // case ModelProvider.Moonshot:
      //   this.llm = new MoonshotApi();
      //   break;
      case ModelProvider.DeepSeek:
        this.llm = new DeepSeekApi();
        break;
      default:
        this.llm = new DeepSeekApi();
    }
  }

  config() {}

  prompts() {}

  masks() {}
}

export function getClientApi(provider: ServiceProvider): ClientApi {
  switch (provider) {
    case ServiceProvider.Gemini:
      return new ClientApi(ModelProvider.GeminiPro);
    // case ServiceProvider.Moonshot:
    //   return new ClientApi(ModelProvider.Moonshot);
    case ServiceProvider.DeepSeek:
    default:
      return new ClientApi(ModelProvider.DeepSeek);
  }
}
