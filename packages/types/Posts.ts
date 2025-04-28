export type Post = {
  id: number;
  idea: string;
  content: string;
  title?: string;
  image?: string;
  avatarUrl?: string;
  emailOrUserName?: string;
  name?: string;
  credentialId?: number;
  createdDate?: Date;
  appId: string;
  pageId?: string;
};
