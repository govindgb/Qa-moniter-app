export interface Tag {
  _id: string;
  label: string;
  tagType: 'Feature' | 'Application' | 'BuildVersion' | 'Environment' | 'Device' | 'Sprints';
  workingOn?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagRequest {
  label: string;
  tagType: 'Feature' | 'Application' | 'BuildVersion' | 'Environment' | 'Device' | 'Sprints';
  workingOn?: string;
}

export interface UpdateTagRequest extends CreateTagRequest {
  _id: string;
}

export interface TagContextType {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  createTag: (tag: CreateTagRequest) => Promise<void>;
  getTags: (includeDetails?: boolean) => Promise<void>;
  updateTag: (id: string, tag: CreateTagRequest) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  getTagById: (id: string) => Promise<Tag | null>;
}
