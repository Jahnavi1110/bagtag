export type TagStatus = "safe" | "lost" | "found";
export type TemplateId = "luggage" | "round" | "keychain" | "school" | "laptop";

export type TagDesign = {
  template: TemplateId;
  color: string;
  customText: string;
};

export type Tag = {
  id: string;
  code: string;
  itemName: string;
  photoPath: string | null;
  note: string | null;
  design: TagDesign;
  status: TagStatus;
  scanCount: number;
  createdAt: string;
};

export type TagSummary = Tag & { unreadCount: number; conversationCount: number };

/** The ONLY tag fields a finder is ever allowed to see. No owner id, email or contact data. */
export type PublicTag = Pick<Tag, "code" | "itemName" | "photoPath" | "note" | "status">;

export type Message = {
  id: string;
  sender: "finder" | "owner";
  body: string;
  lat: number | null;
  lng: number | null;
  createdAt: string;
};

export type Conversation = { id: string; createdAt: string; messages: Message[]; unread: number };
