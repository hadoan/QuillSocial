import { useBrainProvider } from "@lib/hooks/Chat/useBrainProvider";

export const roles = ["Viewer", "Editor", "Owner"] as const;

//TODO: move these types to a shared place
export type BrainRoleType = (typeof roles)[number];

export type BrainRoleAssignation = {
  email: string;
  role: BrainRoleType;
  id: string;
};

export type BrainAccessStatus = "private" | "public";

export type Brain = {
  id: string;
  name: string;
  documents?: Document[];
  status?: BrainAccessStatus;
  model?: Model;
  max_tokens?: number;
  temperature?: number;
  openai_api_key?: string;
  description?: string;
  prompt_id?: string | null;
};

export type MinimalBrainForUser = {
  id: string;
  name: string;
  role: BrainRoleType;
  status: BrainAccessStatus;
  memberCount?: number;
  members?: number[];
};

//TODO: rename rights to role in Backend and use MinimalBrainForUser instead of BackendMinimalBrainForUser
export type BackendMinimalBrainForUser = Omit<MinimalBrainForUser, "role"> & {
  rights: BrainRoleType;
};

export type PublicBrain = {
  id: string;
  name: string;
  description?: string;
  number_of_subscribers: number;
  last_update: string;
};

export type BrainContextType = ReturnType<typeof useBrainProvider>;

export const brainStatuses = ["private", "public"] as const;

export type BrainStatus = (typeof brainStatuses)[number];

export type BrainConfig = {
  model: Model;
  temperature: number;
  maxTokens: number;
  keepLocal: boolean;
  backendUrl?: string;
  openAiKey?: string;
  anthropicKey?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  prompt_id?: string;
  status: BrainStatus;
  prompt: {
    title: string;
    content: string;
  };
  name: string;
  description: string;
  setDefault: boolean;
};

export type BrainConfigContextType = {
  config: BrainConfig;
};

export const openAiFreeModels = ["gpt-3.5-turbo", "gpt-3.5-turbo-16k"] as const;

export const openAiPaidModels = [...openAiFreeModels, "gpt-4"] as const;

export const anthropicModels = [
  // "claude-v1",
  // "claude-v1.3",
  // "claude-instant-v1-100k",
  // "claude-instant-v1.1-100k",
] as const;

export const googleModels = [
  //"vertexai"
] as const; // TODO activate when not in demo mode

// export const googleModels = [] as const;
export const freeModels = [
  ...openAiFreeModels,
  // ...anthropicModels,
  // ...googleModels,
] as const;

export const paidModels = [...openAiPaidModels] as const;

export type PaidModels = (typeof paidModels)[number];

export type Model = (typeof freeModels)[number];

export type SubscriptionUpdatableProperties = {
  role: BrainRoleType | null;
};

export type CreateBrainInput = {
  name: string;
  description?: string;
  status?: BrainStatus;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  openai_api_key?: string;
  prompt_id?: string | null;
  user_ids?: number[];
};

export type UpdateBrainInput = Partial<CreateBrainInput>;

export type Prompt = {
  id: string;
  title: string;
  content: string;
};

export const mapBackendMinimalBrainToMinimalBrain = (
  backendMinimalBrain: BackendMinimalBrainForUser
): MinimalBrainForUser => ({
  id: backendMinimalBrain.id,
  name: backendMinimalBrain.name,
  role: backendMinimalBrain.rights,
  status: backendMinimalBrain.status,
  memberCount: backendMinimalBrain.memberCount,
});

//Knowledge
export type Knowledge = UploadedKnowledge | CrawledKnowledge;

export interface UploadedKnowledge {
  id: string;
  brainId: string;
  fileName: string;
  extension: string;
}

export interface CrawledKnowledge {
  id: string;
  brainId: string;
  url: string;
  extension: string;
}

export type DeleteKnowledgeInputProps = {
  brainId: string;
  knowledgeId: string;
};

export const isUploadedKnowledge = (
  knowledge: Knowledge
): knowledge is UploadedKnowledge => {
  return "fileName" in knowledge && !("url" in knowledge);
};

export type GetAllKnowledgeInputProps = {
  brainId: string;
};

export interface BEKnowledge {
  id: string;
  brain_id: string;
  file_name: string | null;
  url: string | null;
  extension: string;
}

// Upload file with branid
export type UploadResponse = {
  data: { type: string; message: string };
};

export type UploadInputProps = {
  brainId: string;
  formData: FormData;
  chat_id?: string;
};
