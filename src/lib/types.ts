export type User = {
  _id: string;
  name: string;
  phone: string;
  createdAt?: string;
};

export type LastMessage =
  | Record<string, never>
  | {
      text: string;
      sender: string;
      createdAt: string;
    };

export type DirectConversation = {
  _id: string;
  type: "direct";
  lastMessage: LastMessage;
  updatedAt: string;
  participant: User;
};

export type GroupConversation = {
  _id: string;
  type: "group";
  name: string;
  createdBy: string;
  admins: string[];
  participants: User[];
  createdAt?: string;
  updatedAt: string;
  lastMessage?: LastMessage;
};

export type Conversation = DirectConversation | GroupConversation;

export type Message = {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  createdAt: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type MessagesResponse = {
  messages: Message[];
  hasMore: boolean;
};

export type ApiErrorBody = {
  error?: {
    message?: string;
    code?: string | number;
  };
  message?: string;
};

