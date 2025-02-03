export interface SocialComment {
  id: number;
  userId: string;
  username: string;
  game: string;
  comment: string;
  likes: number;
  parentCommentId: number | null;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
