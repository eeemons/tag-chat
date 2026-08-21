# Chat API Documentation

This is the implementation-facing API documentation for the chat app. Request field names and request body shapes come from the provided API field list; response bodies, status codes, and behavioral notes come from live API tests run against the deployed service on 2026-08-21.

```text
REST base URL: https://frontend-task-chatapp.onrender.com/api
Socket URL:    https://frontend-task-chatapp.onrender.com
```

Protected REST requests use:

```http
Authorization: Bearer <token>
```

The API returns Mongo-style `_id` fields. Frontend code should normalize around `_id` unless a local view model maps it to `id`.

## Auth

### Endpoint List

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/login` | Log in or register with phone and name. |
| `GET` | `/auth/me` | Read the current authenticated user. |

### `POST /auth/login`

Auth required: no

Request body:

```json
{
  "phone": "+15551234567",
  "name": "Ada Lovelace"
}
```

Observed success:

```http
200 OK
```

```json
{
  "token": "<jwt>",
  "user": {
    "_id": "6a882a8be5d6aac97521e6c6",
    "name": "Doc Alpha 08682645",
    "phone": "+88019990868264597",
    "createdAt": "2026-08-21T10:38:03.958Z"
  }
}
```

Response shape:

```ts
type LoginResponse = {
  token: string;
  user: {
    _id: string;
    name: string;
    phone: string;
    createdAt: string;
  };
};
```

Implementation notes:

- Save `token` after login.
- Use `user._id` as the current user identifier.
- Reusing an existing phone number logs that user in and returns a token.

Test cases:

| Case | Request | Expected |
| --- | --- | --- |
| New phone login | Valid `phone` and `name` | `200 OK`, token, full user. |
| Existing phone login | Same `phone` with a `name` | `200 OK`, token, same user account. |
| Missing phone | Body without `phone` | Error response; document observed status during validation testing. |
| Missing name | Body without `name` | Error response; document observed status during validation testing. |

### `GET /auth/me`

Auth required: yes

Request body: none

Observed success:

```http
200 OK
```

```json
{
  "_id": "6a882a8be5d6aac97521e6c6",
  "name": "Doc Alpha 08682645",
  "phone": "+88019990868264597",
  "createdAt": "2026-08-21T10:38:03.958Z"
}
```

Observed missing-token response:

```http
400 Bad Request
```

```json
{
  "error": {
    "message": "No token provided",
    "code": "NO_TOKEN"
  }
}
```

Observed invalid-token response:

```http
401 Unauthorized
```

```json
{
  "error": {
    "message": "Invalid token",
    "code": "INVALID_TOKEN"
  }
}
```

Implementation notes:

- Use this endpoint to restore a saved session.
- Clear local session state when the token is missing or invalid.

Test cases:

| Case | Request | Expected |
| --- | --- | --- |
| Valid token | Bearer token from login | `200 OK`, current user. |
| Missing token | No `Authorization` header | `400 Bad Request`, `NO_TOKEN`. |
| Invalid token | Malformed bearer token | `401 Unauthorized`, `INVALID_TOKEN`. |

## Users

### Endpoint List

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/users/search?q={query}` | Search users by name or phone. |

### `GET /users/search`

Auth required: yes

Query parameters:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `q` | string | yes | Search text. |

Observed success:

```http
200 OK
```

```json
[
  {
    "_id": "6a882a8ce5d6aac97521e6cb",
    "name": "Doc Beta 08682645",
    "phone": "+88019990868264598"
  }
]
```

Observed empty success:

```http
200 OK
```

```json
[]
```

Observed phone-search issue:

```http
500 Internal Server Error
```

```json
{
  "error": {
    "message": "Regular expression is invalid: quantifier does not follow a repeatable item",
    "code": 51091
  }
}
```

The server error occurred when `q` included a leading `+`, for example `+88019990868264598`.

Response shape:

```ts
type SearchUsersResponse = Array<{
  _id: string;
  name: string;
  phone: string;
}>;
```

Implementation notes:

- Use this for direct-chat lookup and group member selection.
- Name search worked reliably in live tests.
- Treat `500` from search as recoverable UI state.

Test cases:

| Case | Request | Expected |
| --- | --- | --- |
| Search by exact name | `q=Doc Beta ...` | `200 OK`, matching user array. |
| Search no result | Unknown `q` | `200 OK`, empty array. |
| Search phone with `+` | `q=+880...` | Currently observed `500`; frontend should show error. |
| Missing token | Valid `q`, no token | Auth error. |
| Empty query | `q=` | Document observed status before relying on behavior. |

## Conversations

### Endpoint List

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/conversations` | List current user's direct and group conversations. |
| `POST` | `/conversations` | Start or reopen a direct conversation. |
| `GET` | `/conversations/{id}/messages` | Read message history for a conversation. |

### `GET /conversations`

Auth required: yes

Request body: none

Observed empty success:

```http
200 OK
```

```json
{
  "data": []
}
```

Observed success:

```json
{
  "data": [
    {
      "_id": "6a882a98e5d6aac97521e6f8",
      "type": "group",
      "lastMessage": {},
      "updatedAt": "2026-08-21T10:38:23.065Z",
      "name": "Docs Group Renamed 08682645",
      "createdBy": "6a882a8be5d6aac97521e6c6",
      "admins": [
        "6a882a8be5d6aac97521e6c6",
        "6a882a8ce5d6aac97521e6cb"
      ],
      "participants": [
        {
          "_id": "6a882a8be5d6aac97521e6c6",
          "name": "Doc Alpha 08682645",
          "phone": "+88019990868264597"
        }
      ]
    },
    {
      "_id": "6a882a91e5d6aac97521e6e2",
      "type": "direct",
      "lastMessage": {
        "text": "Hello from API documentation probe 08682645",
        "sender": "6a882a8be5d6aac97521e6c6",
        "createdAt": "2026-08-21T10:38:12.795Z"
      },
      "updatedAt": "2026-08-21T10:38:13.029Z",
      "participant": {
        "_id": "6a882a8ce5d6aac97521e6cb",
        "name": "Doc Beta 08682645",
        "phone": "+88019990868264598"
      }
    }
  ]
}
```

Response shape:

```ts
type ConversationsResponse = {
  data: Array<DirectConversationListItem | GroupConversationListItem>;
};

type DirectConversationListItem = {
  _id: string;
  type: "direct";
  lastMessage: Record<string, never> | {
    text: string;
    sender: string;
    createdAt: string;
  };
  updatedAt: string;
  participant: {
    _id: string;
    name: string;
    phone: string;
  };
};

type GroupConversationListItem = {
  _id: string;
  type: "group";
  lastMessage: Record<string, never> | {
    text: string;
    sender: string;
    createdAt: string;
  };
  updatedAt: string;
  name: string;
  createdBy: string;
  admins: string[];
  participants: Array<{
    _id: string;
    name: string;
    phone: string;
  }>;
};
```

Implementation notes:

- Response is wrapped in `data`.
- Direct conversations expose the other user as `participant`.
- Group conversations expose `name`, `participants`, and `admins`.
- `lastMessage` can be `{}`.

Test cases:

| Case | Request | Expected |
| --- | --- | --- |
| New account | `GET /conversations` after login | `200 OK`, `{ "data": [] }`. |
| After direct chat | Create direct conversation, list | Direct item appears. |
| After group create | Create group, list | Group item appears. |
| Missing token | No auth header | Auth error. |

### `POST /conversations`

Auth required: yes

Request body:

```json
{
  "userId": "6a882a8ce5d6aac97521e6cb"
}
```

Observed success:

```http
200 OK
```

```json
{
  "_id": "6a882a91e5d6aac97521e6e2",
  "participants": [
    "6a882a8be5d6aac97521e6c6",
    "6a882a8ce5d6aac97521e6cb"
  ],
  "createdAt": "2026-08-21T10:38:09.891Z"
}
```

Response shape:

```ts
type StartDirectConversationResponse = {
  _id: string;
  participants: string[];
  createdAt: string;
};
```

Implementation notes:

- Repeating this request for the same user pair returned the same conversation.
- Fetch `/conversations` after creation if the UI needs the full list item shape.

Test cases:

| Case | Request | Expected |
| --- | --- | --- |
| Start direct conversation | Valid `userId` | `200 OK`, conversation with participant IDs. |
| Reopen existing direct | Same `userId` again | `200 OK`, same conversation `_id`. |
| Invalid user | Unknown `userId` | Document observed error status. |
| Missing token | Valid body, no token | Auth error. |

### `GET /conversations/{id}/messages`

Auth required: yes

Path parameters:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Conversation ID. |

Query parameters:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `limit` | integer | no | Maximum number of messages. |
| `before` | string | no | Cursor/message ID for older-message loading. |

Observed empty success:

```http
200 OK
```

```json
{
  "messages": [],
  "hasMore": false
}
```

Observed success:

```json
{
  "messages": [
    {
      "_id": "6a882a94e5d6aac97521e6ec",
      "conversation": "6a882a91e5d6aac97521e6e2",
      "sender": "6a882a8be5d6aac97521e6c6",
      "text": "Hello from API documentation probe 08682645",
      "createdAt": "2026-08-21T10:38:12.795Z"
    }
  ],
  "hasMore": false
}
```

Response shape:

```ts
type MessagesResponse = {
  messages: Array<{
    _id: string;
    conversation: string;
    sender: string;
    text: string;
    createdAt: string;
  }>;
  hasMore: boolean;
};
```

Implementation notes:

- Use `sender === currentUser._id` to identify outgoing messages.
- A single-message probe with `before=<messageId>` still returned that message. Verify multi-message pagination before final infinite-scroll behavior.

Test cases:

| Case | Request | Expected |
| --- | --- | --- |
| Empty conversation | Valid conversation with no messages | `200 OK`, empty `messages`, `hasMore: false`. |
| After sending message | Valid conversation | `200 OK`, sent message appears. |
| Limited page | `limit=1` after multiple messages | At most one message; verify order. |
| Before cursor | `before=<messageId>` | Verify whether cursor is exclusive or inclusive. |
| Unauthorized conversation | Conversation not joined by user | Document observed error status. |

## Groups

### Endpoint List

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/conversations/group` | Create a group conversation. |
| `POST` | `/conversations/{id}/participants` | Add group members. |
| `DELETE` | `/conversations/{id}/participants/{userId}` | Remove a member or leave a group. |
| `POST` | `/conversations/{id}/admins` | Promote a member to admin. |
| `PATCH` | `/conversations/{id}` | Rename a group. |

### `POST /conversations/group`

Auth required: yes

Request body:

```json
{
  "name": "Project Team",
  "participantIds": [
    "6a882a8ce5d6aac97521e6cb",
    "6a882a8de5d6aac97521e6ce"
  ]
}
```

Observed success:

```http
201 Created
```

```json
{
  "_id": "6a882a98e5d6aac97521e6f8",
  "type": "group",
  "name": "Docs Group 08682645",
  "createdBy": "6a882a8be5d6aac97521e6c6",
  "admins": [
    "6a882a8be5d6aac97521e6c6"
  ],
  "participants": [
    {
      "_id": "6a882a8be5d6aac97521e6c6",
      "name": "Doc Alpha 08682645",
      "phone": "+88019990868264597"
    },
    {
      "_id": "6a882a8ce5d6aac97521e6cb",
      "name": "Doc Beta 08682645",
      "phone": "+88019990868264598"
    },
    {
      "_id": "6a882a8de5d6aac97521e6ce",
      "name": "Doc Gamma 08682645",
      "phone": "+88019990868264599"
    }
  ],
  "createdAt": "2026-08-21T10:38:16.225Z",
  "updatedAt": "2026-08-21T10:38:16.225Z"
}
```

Response shape:

```ts
type GroupConversation = {
  _id: string;
  type: "group";
  name: string;
  createdBy: string;
  admins: string[];
  participants: Array<{
    _id: string;
    name: string;
    phone: string;
  }>;
  createdAt: string;
  updatedAt: string;
};
```

Implementation notes:

- The current user is included automatically.
- The creator is added to `admins`.

Test cases:

| Case | Request | Expected |
| --- | --- | --- |
| Create group | `name` and two participant IDs | `201 Created`, group body. |
| Missing name | No `name` | Document observed validation error. |
| Too few participants | Empty or one participant ID | Document observed validation error. |
| Unknown participant | Invalid participant ID | Document observed error status. |

### `POST /conversations/{id}/participants`

Auth required: yes

Path parameters:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Group conversation ID. |

Request body:

```json
{
  "userIds": [
    "6a882a8ee5d6aac97521e6d1"
  ]
}
```

Observed success:

```http
200 OK
```

Returns the updated group conversation.

Implementation notes:

- Successful response includes the new participant in `participants`.
- Admin-only behavior should be validated from the frontend before exposing controls.

Test cases:

| Case | Request | Expected |
| --- | --- | --- |
| Admin adds member | Valid group and `userIds` | `200 OK`, updated group. |
| Non-admin adds member | Same body with non-admin token | Permission error. |
| Add existing member | Existing participant ID | Document observed behavior. |
| Add unknown user | Unknown user ID | Document observed error status. |

### `DELETE /conversations/{id}/participants/{userId}`

Auth required: yes

Path parameters:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Group conversation ID. |
| `userId` | string | yes | User ID to remove. Use current user's ID to leave. |

Request body: none

Observed success:

```http
200 OK
```

Returns the updated group conversation with the removed user omitted from `participants`.

Implementation notes:

- Admin remove and member leave use the same endpoint.
- Passing the current user's ID with that user's token removed that user from the group in live testing.

Test cases:

| Case | Request | Expected |
| --- | --- | --- |
| Admin removes member | Admin token and member `userId` | `200 OK`, member omitted. |
| Member leaves group | Current user's own `userId` | `200 OK`, current user omitted. |
| Non-admin removes another member | Non-admin token | Permission error. |
| Remove unknown member | Unknown or nonparticipant `userId` | Document observed behavior. |

### `POST /conversations/{id}/admins`

Auth required: yes

Path parameters:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Group conversation ID. |

Request body:

```json
{
  "userId": "6a882a8ce5d6aac97521e6cb"
}
```

Observed success:

```http
200 OK
```

Returns the updated group conversation with the promoted user ID included in `admins`.

Implementation notes:

- Only promote users who are already in `participants`.
- Use `admins.includes(currentUser._id)` to gate admin controls in the UI.

Test cases:

| Case | Request | Expected |
| --- | --- | --- |
| Promote member | Admin token and participant `userId` | `200 OK`, user added to `admins`. |
| Promote nonmember | Admin token and nonparticipant ID | Document observed error status. |
| Non-admin promotes | Non-admin token | Permission error. |
| Promote existing admin | Existing admin ID | Document observed behavior. |

### `PATCH /conversations/{id}`

Auth required: yes

Path parameters:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Group conversation ID. |

Request body:

```json
{
  "name": "Renamed Team"
}
```

Observed success:

```http
200 OK
```

Returns the updated group conversation with the new `name`.

Implementation notes:

- Use this endpoint only for group rename flows.
- Update local conversation list with the returned group or refetch conversations.

Test cases:

| Case | Request | Expected |
| --- | --- | --- |
| Rename group | Admin token and non-empty `name` | `200 OK`, updated `name`. |
| Empty name | Admin token and empty/blank `name` | Document observed validation behavior. |
| Non-admin rename | Non-admin token | Permission error. |
| Rename direct conversation | Direct conversation ID | Document observed error status. |

## Messages

### Endpoint List

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/messages` | Send a message to a direct or group conversation. |

### `POST /messages`

Auth required: yes

Request body:

```json
{
  "conversationId": "6a882a91e5d6aac97521e6e2",
  "text": "Hello!"
}
```

Observed success:

```http
200 OK
```

```json
{
  "_id": "6a882a94e5d6aac97521e6ec",
  "conversation": "6a882a91e5d6aac97521e6e2",
  "sender": "6a882a8be5d6aac97521e6c6",
  "text": "Hello from API documentation probe 08682645",
  "createdAt": "2026-08-21T10:38:12.795Z"
}
```

Response shape:

```ts
type Message = {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  createdAt: string;
};
```

Observed validation behavior:

- A whitespace-only message (`"   "`) was accepted and persisted with `200 OK`.

Implementation notes:

- The frontend must block trimmed-empty messages before sending.
- Use returned `_id` to dedupe any later real-time echo.

Test cases:

| Case | Request | Expected |
| --- | --- | --- |
| Send valid message | Valid `conversationId` and text | `200 OK`, message body. |
| Send blank message | Text is empty or whitespace | API currently accepts whitespace; frontend should block. |
| Unknown conversation | Invalid `conversationId` | Document observed error status. |
| Not a participant | User sends to conversation they are not in | Document observed permission behavior. |

## System

### Endpoint List

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` at host root | Health check. |

### `GET /health`

Auth required: no

Observed working request:

```http
GET https://frontend-task-chatapp.onrender.com/health
```

Observed success:

```http
200 OK
```

```json
{
  "status": "ok"
}
```

Observed non-working request:

```http
GET https://frontend-task-chatapp.onrender.com/api/health
```

```http
404 Not Found
```

```json
{
  "error": {
    "message": "Route not found",
    "code": "NOT_FOUND"
  }
}
```

Test cases:

| Case | Request | Expected |
| --- | --- | --- |
| Root health | `GET /health` at host root | `200 OK`, `{ "status": "ok" }`. |
| API health path | `GET /api/health` | Currently `404 NOT_FOUND`. |

## Realtime

### Endpoint/Event List

| Direction | Name | Purpose |
| --- | --- | --- |
| Socket connection | host root | Connect Socket.io client. |
| Client to server | `message:send` | Send a message through the socket. |
| Server to client | `message:new` | Receive a new message. |
| Server to client | `conversation:updated` | Receive group/conversation updates. |

Socket URL:

```text
https://frontend-task-chatapp.onrender.com
```

Connection shape:

```ts
import { io } from "socket.io-client";

const socket = io("https://frontend-task-chatapp.onrender.com", {
  auth: { token },
});
```

Send-message event body:

```json
{
  "conversationId": "6a882a91e5d6aac97521e6e2",
  "text": "Hello!"
}
```

Observed low-level Socket.io polling handshake without application auth:

```http
GET https://frontend-task-chatapp.onrender.com/socket.io/?EIO=4&transport=polling
```

```http
200 OK
```

```text
0{"sid":"<socket-session-id>","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}
```

Implementation notes:

- Install `socket.io-client` in the frontend app.
- Pass the JWT in `auth.token`.
- Verify exact `message:new` and `conversation:updated` payloads during app implementation.
- Dedupe REST-created messages against real-time messages by `_id`.

Test cases:

| Case | Request/Event | Expected |
| --- | --- | --- |
| Connect with valid token | Socket.io `auth.token` | Connect succeeds. |
| Connect with invalid token | Bad `auth.token` | Connection rejected or error event. |
| Send socket message | `message:send` body | Sender and recipient receive/update message state. |
| Receive new message | Other user sends message | `message:new` fires with message payload. |
| Group update | Rename/add/remove/promote | `conversation:updated` fires with updated conversation payload. |

