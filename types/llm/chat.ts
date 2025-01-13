import { MessageRole, MultimodalContent } from ".";

export interface RequestMessage {
  role: MessageRole;
  content: string | MultimodalContent[];
}

export type ChatMessageTool = {
  id: string;
  index?: number;
  type?: string;
  function?: {
    name: string;
    arguments?: string;
  };
  content?: string;
  isError?: boolean;
  errorMsg?: string;
};

export type ChatMessage = RequestMessage & {
  date: string;
  streaming?: boolean;
  isError?: boolean;
  id: string;
  model?: string;
  tools?: ChatMessageTool[];
  audio_url?: string;
};
