export type ChatAttachment = {
  id: string;
  dataUrl: string;
  mimeType: string;
};

export function createAttachmentId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
