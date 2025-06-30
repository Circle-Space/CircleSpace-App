export interface SavePayload {
  isNewCollection: boolean;
  ugcId?: string;
  collectionInfo: {
    name: string;
    visibility: string;
    contentType?: string;
    collectionId?: string;
  };
} 