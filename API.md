# Chat API Reference

Local reference created from the provided Swagger/OpenAPI text for future implementation work.

## Overview

- API name: Chat API
- Version: 1.0.0
- Purpose: Real-time one-to-one and group chat API for the take-home assignment.
- Protocols:
  - REST for authentication, users, conversations, groups, messages, and health.
  - Socket.io WebSocket for real-time message and conversation updates.

The source Swagger is intentionally request-focused. It lists endpoints, methods, parameters, and request bodies, but does not define response bodies or status codes. Response shapes should be inspected from the live API and added to this file as implementation work progresses.

## Base URLs

```text
REST API:   https://frontend-task-chatapp.onrender.com/api
Socket.io:  https://frontend-task-chatapp.onrender.com
Swagger:    https://frontend-task-chatapp.onrender.com/docs/
```

Important: Socket.io connects to the host root, not the REST `/api` base.

## Authentication

Login and registration share one endpoint:

```http
POST /auth/login
```

If the phone number is new, the API registers the user automatically. If the phone number already exists, the API logs in that user. The login response includes a JWT.

Protected REST requests must include:

```http
Authorization: Bearer <token>
```

Socket.io requests must pass the same token in the handshake auth:

```ts
const socket = io("https://frontend-task-chatapp.onrender.com", {
  auth: { token },
});
```

Missing or invalid WebSocket tokens are rejected.

## REST Endpoints

All paths below are relative to:

```text
https://frontend-task-chatapp.onrender.com/api
```

### Auth

#### `POST /auth/login`

Log in or register with phone number and name.

Auth required: no

Request body:

```json
{
  "phone": "+15551234567",
  "name": "Ada Lovelace"
}
```

Fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `phone` | string | yes | Phone number. New unique phone numbers are registered automatically. |
| `name` | string | yes | User display name. |

Known response notes:

- Response includes a JWT.
- Exact response shape and status codes need live inspection.

Implementation use:

- Primary login/register action.
- Store returned token for protected REST calls and Socket.io auth.

#### `GET /auth/me`

Get the current user associated with the bearer token.

Auth required: yes

Request body: none

Parameters: none

Known response notes:

- Useful for restoring a session from a stored token.
- Exact response shape and status codes need live inspection.

Implementation use:

- Session restore on app load.
- Validate stored token.

### Users

#### `GET /users/search`

Search users by name or phone.

Auth required: yes

Query parameters:

| Parameter | Type | Required | Example | Notes |
| --- | --- | --- | --- | --- |
| `q` | string | yes | `Ada` | Search term for a user's name or phone number. |

Request body: none

Known response notes:

- Exact response shape and status codes need live inspection.

Implementation use:

- Find a user before starting a direct conversation.
- Find multiple users for group creation.

### Conversations

#### `GET /conversations`

List conversations the current user belongs to, including direct and group conversations.

Auth required: yes

Request body: none

Parameters: none

Known response notes:

- Exact response shape and status codes need live inspection.

Implementation use:

- Populate sidebar or conversation list.
- Refresh after starting direct chats, creating groups, or receiving `conversation:updated`.

#### `POST /conversations`

Start or open a one-to-one conversation with another user.

Auth required: yes

Request body:

```json
{
  "userId": "665f0c2a9b1e4a0012ab34cd"
}
```

Fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `userId` | string | yes | ID of the other user. |

Known response notes:

- Likely returns the existing or newly created conversation.
- Exact response shape and status codes need live inspection.

Implementation use:

- Start direct conversation from search results.

#### `GET /conversations/{id}/messages`

Get paginated message history for a conversation.

Auth required: yes

Path parameters:

| Parameter | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Conversation ID. |

Query parameters:

| Parameter | Type | Required | Example | Notes |
| --- | --- | --- | --- | --- |
| `limit` | integer | no | `20` | Maximum number of messages to return per page. |
| `before` | string | no | message cursor | Cursor for fetching messages before a given message. |

Request body: none

Known response notes:

- Used for initial message load and loading older messages.
- Exact response shape, cursor semantics, and status codes need live inspection.

Implementation use:

- Load current conversation history.
- Support pagination for older messages.
- Preserve scroll position when prepending older messages.

### Groups

#### `POST /conversations/group`

Create a group conversation. The creator becomes an admin.

Auth required: yes

Request body:

```json
{
  "name": "Project Team",
  "participantIds": ["string"]
}
```

Fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | Group name. |
| `participantIds` | string[] | yes | Users to include in the group. Groups are intended for three or more members total. |

Known response notes:

- Exact response shape and status codes need live inspection.

Implementation use:

- Group creation flow.

#### `POST /conversations/{id}/participants`

Add one or more members to a group. Admins only.

Auth required: yes

Path parameters:

| Parameter | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Group conversation ID. |

Request body:

```json
{
  "userIds": ["string"]
}
```

Fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `userIds` | string[] | yes | User IDs to add. |

Known response notes:

- Exact response shape and status codes need live inspection.

Implementation use:

- Group management UI for admins.

#### `DELETE /conversations/{id}/participants/{userId}`

Remove a member from a group, or leave a group by passing the current user's own ID.

Auth required: yes

Path parameters:

| Parameter | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Group conversation ID. |
| `userId` | string | yes | Member to remove. Use current user's ID to leave the group. |

Request body: none

Permission notes:

- Admins can remove members.
- Any member can leave by passing their own ID.

Known response notes:

- Exact response shape and status codes need live inspection.

Implementation use:

- Leave group action.
- Admin remove-member action.

#### `POST /conversations/{id}/admins`

Promote an existing group member to admin. Admins only.

Auth required: yes

Path parameters:

| Parameter | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Group conversation ID. |

Request body:

```json
{
  "userId": "string"
}
```

Fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `userId` | string | yes | Existing group member to promote. |

Known response notes:

- Exact response shape and status codes need live inspection.

Implementation use:

- Group admin management.

#### `PATCH /conversations/{id}`

Rename a group. Admins only.

Auth required: yes

Path parameters:

| Parameter | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Group conversation ID. |

Request body:

```json
{
  "name": "Renamed Team"
}
```

Fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | New group name. |

Known response notes:

- Exact response shape and status codes need live inspection.

Implementation use:

- Rename group UI for admins.

### Messages

#### `POST /messages`

Send a message to a direct or group conversation.

Auth required: yes

Request body:

```json
{
  "conversationId": "string",
  "text": "Hello!"
}
```

Fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `conversationId` | string | yes | Target direct or group conversation. |
| `text` | string | yes | Message text. Empty messages should be blocked by the client. |

Known response notes:

- Messages are also delivered over WebSocket via `message:new`.
- The Swagger says messages can be sent via REST or socket, but the explicit documented REST endpoint is `POST /messages` and the explicit socket event is `message:send`.
- Exact response shape and status codes need live inspection.

Implementation use:

- Send message form.
- Optimistic updates may be possible after response shape is known.

### System

#### `GET /health`

Health check.

Auth required: probably no, but verify live.

Request body: none

Parameters: none

Known response notes:

- Exact response shape and status codes need live inspection.

Implementation use:

- Optional diagnostics.

## WebSocket Events

Socket.io server origin:

```text
https://frontend-task-chatapp.onrender.com
```

Connection:

```ts
import { io } from "socket.io-client";

const socket = io("https://frontend-task-chatapp.onrender.com", {
  auth: { token },
});
```

### Client To Server

#### `message:send`

Send a message over the socket.

Payload:

```json
{
  "conversationId": "string",
  "text": "Hello!"
}
```

Notes:

- Optional acknowledgement callback may be supported.
- Verify ack shape during implementation.
- REST `POST /messages` is also available for sending.

### Server To Client

#### `message:new`

Emitted when a new message arrives for the current user.

Payload:

```json
{
  "todo": "Inspect live payload shape"
}
```

Implementation use:

- Append incoming messages to the active conversation if they belong there.
- Update conversation previews/unread state if implemented.
- Respect scroll behavior: auto-scroll only when the user is near the bottom.

#### `conversation:updated`

Emitted when a group the current user belongs to changes.

Reasons:

- Group created.
- Group renamed.
- Members changed.
- Admins changed.

Payload:

```json
{
  "todo": "Inspect live payload shape"
}
```

Implementation use:

- Refresh or patch conversation list.
- Update active group metadata if currently open.

## Entity Concepts

The Swagger references these domain objects but does not define their full response schemas:

- User
- Conversation
- Direct conversation
- Group conversation
- Message
- Admin
- Participant
- JWT/session

Expected fields to confirm during live inspection:

### User

```ts
type User = {
  id: string;
  phone: string;
  name: string;
  // Exact field names may differ: _id vs id, createdAt, updatedAt, etc.
};
```

### Conversation

```ts
type Conversation = {
  id: string;
  type: "direct" | "group";
  name?: string;
  participants: User[];
  admins?: User[] | string[];
  lastMessage?: Message;
  createdAt?: string;
  updatedAt?: string;
};
```

### Message

```ts
type Message = {
  id: string;
  conversationId: string;
  sender: User | string;
  text: string;
  createdAt: string;
};
```

These are implementation hypotheses only. Replace them with observed API shapes after live testing.

## Client Behavior Requirements Tied To API

- Store JWT after `POST /auth/login`.
- Call `GET /auth/me` to restore a session.
- Use `GET /users/search?q=...` for direct chat and group member selection.
- Use `POST /conversations` to create or open direct conversations.
- Use `POST /conversations/group` for group creation.
- Use group management endpoints only when the current user is an admin.
- Use `GET /conversations/{id}/messages?limit=...&before=...` for message history and older-message pagination.
- Use `POST /messages` or Socket.io `message:send` for sending messages.
- Listen to `message:new` for incoming messages and real-time UI updates.
- Listen to `conversation:updated` for group metadata/list changes.
- Block empty or whitespace-only messages on the client before sending.
- Handle loading, empty, and error states for each network surface.

## Response Shape Inspection Checklist

Fill these in once the API is tested:

- [ ] `POST /auth/login` status codes and response body.
- [ ] `GET /auth/me` response body and invalid-token behavior.
- [ ] `GET /users/search` response body, empty results, and minimum query behavior.
- [ ] `GET /conversations` response body.
- [ ] `POST /conversations` response body for new vs existing direct conversations.
- [ ] `GET /conversations/{id}/messages` response body, sort order, pagination cursor, and empty page behavior.
- [ ] `POST /conversations/group` response body and minimum participant validation.
- [ ] Group management endpoint success/error response bodies.
- [ ] `POST /messages` response body, validation errors, and whether socket echo duplicates REST response.
- [ ] Socket.io `message:new` payload.
- [ ] Socket.io `conversation:updated` payload.
- [ ] `GET /health` response body.

