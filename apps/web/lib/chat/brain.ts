import {
  Brain,
  CreateBrainInput,
  MinimalBrainForUser,
  UpdateBrainInput,
  mapBackendMinimalBrainToMinimalBrain,
  GetAllKnowledgeInputProps,
  BEKnowledge,
  Knowledge,
  UploadInputProps,
  UploadResponse,
  DeleteKnowledgeInputProps,
} from "@lib/types/brains";

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "";
export const BRAINS_QUERY_KEY = "brains";
export const BRAIN_QUERY_KEY = "brain";
export const KNOWLEDGE_QUERY_KEY = "knowledge";

export const createBrain = async (brain: CreateBrainInput): Promise<MinimalBrainForUser> => {
  const response = await fetch(`${API_URL}/brains`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(brain),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.detail ?? response.statusText);
  }

  const data = await response.json();

  return mapBackendMinimalBrainToMinimalBrain(data);
};

export const updateBrain = async (brainId: string, brain: UpdateBrainInput): Promise<any> => {
  const response = await fetch(`${API_URL}/brains/${brainId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(brain),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.detail ?? response.statusText);
  }
};

export const getBrain = async (brainId: string): Promise<Brain | undefined> => {
  const response = await fetch(`${API_URL}/brains/${brainId}/`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();

  return data;
};

export const getBrains = async (): Promise<MinimalBrainForUser[]> => {
  const response = await fetch(`${API_URL}/brains`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();

  return data.brains;
};

export const getBrainsByAdmin = async (adminId: string): Promise<MinimalBrainForUser[]> => {
  const response = await fetch(`${API_URL}/brains/${adminId}/admin`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();

  return data.brains;
};

export const deleteBrain = async (brainId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/brains/${brainId}/subscription`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer xxxx",
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
};

export const getDefaultBrain = async (): Promise<MinimalBrainForUser | undefined> => {
  const response = await fetch(`${API_URL}/brains/default/`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();

  return mapBackendMinimalBrainToMinimalBrain(data);
};

export const getKnowledgeByBrainId = async ({ brainId }: any): Promise<Knowledge[]> => {
  const response = await fetch(`${API_URL}/knowledge?brain_id=${brainId}`, {
    method: "GET",
  });
  const data = await response.json();

  return data?.knowledges?.map((knowledge: BEKnowledge) => {
    if (knowledge.file_name !== null) {
      return {
        id: knowledge.id,
        brainId: knowledge.brain_id,
        fileName: knowledge.file_name,
        extension: knowledge.extension,
      };
    } else if (knowledge.url !== null) {
      return {
        id: knowledge.id,
        brainId: knowledge.brain_id,
        url: knowledge.url,
        extension: "URL",
      };
    } else {
      throw new Error(`Invalid knowledge ${knowledge.id}`);
    }
  });
};

export const uploadFileWithBrainId = async (props: UploadInputProps): Promise<UploadResponse> => {
  let uploadUrl = `upload?brain_id=${props.brainId}`;
  if (props.chat_id !== undefined) {
    uploadUrl = uploadUrl.concat(`&chat_id=${props.chat_id}`);
  }

  const response = await fetch(`${API_URL}/${uploadUrl}`, {
    method: "POST",
    body: props.formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail ?? response.statusText);
  }

  return data;
};

export const deleteKnowledge = async ({ knowledgeId, brainId }: DeleteKnowledgeInputProps): Promise<void> => {
  const response = await fetch(`${API_URL}/knowledge/${knowledgeId}?brain_id=${brainId}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail ?? response.statusText);
  }
};
