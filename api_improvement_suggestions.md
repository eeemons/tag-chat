# Backend API Improvement Notes

Dear Taghyeer Team,

While integrating and testing our frontend chat application with the backend APIs (`https://frontend-task-chatapp.onrender.com`), I took detailed notes on several real-world bugs, edge cases, and missing pieces in our current endpoints.

I’ve organized these suggestions by feature area. For each issue, I've outlined **what happens right now**, **why it causes issues for the frontend**, and a **straightforward fix** that any developer on our team can implement quickly.

---

## Table of Contents

1. [Authentication & User Profile](#1-authentication--user-profile)
2. [Conversations (Direct & Group)](#2-conversations-direct--group)
3. [Messages & Chat History](#3-messages--chat-history)
4. [Group Management & Admin Permissions](#4-group-management--admin-permissions)
5. [WebSocket & Real-Time Sync](#5-websocket--real-time-sync)
6. [Consistent Error Formats & Timestamps](#6-consistent-error-formats--timestamps)
7. [Priority Summary Table](#7-priority-summary-table)

---

## 1. Authentication & User Profile

### 1.1 Clean and standardize phone numbers on login

- **Endpoint**: `POST /api/auth/login`
- **What happens right now**: The server saves whatever text string is sent. If someone logs in with `+8801700000000`, and later logs in with `01700000000` or `8801700000000`, the database creates 3 separate user accounts for the exact same person.
- **Why it matters**: Users get split accounts, and their friends can't find them reliably.
- **How to fix it**: Clean up the phone number before querying or saving to MongoDB. Strip spaces/dashes and format it to a standard format (like `+8801700000000`) before running `User.findOne()`.

---

### 1.2 Fix server crash when searching with a `+` symbol

- **Endpoint**: `GET /api/users/search?query=`
- **What happens right now**: If a user searches for `+880` or any search term with special characters like `+`, `(`, or `*`, the server crashes with a `500 Internal Server Error` (`Regular expression is invalid: quantifier does not follow a repeatable item`).
- **Why it matters**: Phone numbers usually start with `+`. When users search for friends by phone number, the search breaks.
- **How to fix it**: Escape special characters before passing user input into a regular expression:
  ```javascript
  // Simple regex escape helper
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const users = await User.find({
    name: { $regex: safeQuery, $options: "i" },
  });
  ```

---

### 1.3 Allow searching by last name or middle name

- **Endpoint**: `GET /api/users/search?query=`
- **What happens right now**: The search only matches the beginning of a name (`^query`). If a user's name is "Lionel Messi", searching for "Messi" returns 0 results.
- **Why it matters**: People frequently search for their friends by their first or last name.
- **How to fix it**: Remove the caret (`^`) from the regex so it matches any part of the name, or use MongoDB text indexes.

---

## 2. Conversations (Direct & Group)

### 2.1 Send `lastMessage: null` instead of `undefined` when creating a group

- **Endpoint**: `POST /api/conversations/group`
- **What happens right now**: When a new group is created, the response object has no `lastMessage` property at all (`undefined`).
- **Why it matters**: The frontend checks `conversation.lastMessage?.createdAt` to sort chats. When `lastMessage` is missing entirely or undefined, it can trigger frontend JavaScript runtime crashes.
- **How to fix it**: Explicitly set `lastMessage: null` on newly created conversations:
  ```javascript
  res.status(201).json({
    ...newGroupConversation.toObject(),
    lastMessage: null,
  });
  ```

---

### 2.2 Prevent creating a direct chat with yourself

- **Endpoint**: `POST /api/conversations/direct`
- **What happens right now**: If someone passes their own user ID, the backend creates a direct chat between the user and themselves.
- **Why it matters**: Creates broken UI states where direct chat headers and participant lists show duplicate "You" avatars.
- **How to fix it**: Add a simple check at the start of the controller:
  ```javascript
  if (targetUserId === req.user._id.toString()) {
    return res
      .status(400)
      .json({ error: "You cannot start a direct chat with yourself." });
  }
  ```

---

### 2.3 Return unread message counts in the conversation list

- **Endpoint**: `GET /api/conversations`
- **What happens right now**: The conversation list returns the chats, but does not tell the client how many unread messages each chat has.
- **Why it matters**: If a user opens the app on a new device or tab, all unread badge counts reset to zero until new socket messages arrive.
- **How to fix it**: Calculate `unreadCount` for each conversation on the server (by counting messages created after the user's last read timestamp) and include `unreadCount: number` in each conversation item.

---

### 2.4 Include sender name in `lastMessage`

- **Endpoint**: `GET /api/conversations`
- **What happens right now**: `lastMessage` only contains raw `{ text, sender: "65a...", createdAt }`.
- **Why it matters**: The sidebar preview has to do extra loops to figure out who said what (e.g. "Alex: see you soon" vs "You: see you soon").
- **How to fix it**: Populate the sender's display name inside `lastMessage.senderName` or populate `sender: { _id, name }`.

---

## 3. Messages & Chat History

### 3.1 Check if the user is actually a member before returning chat history

- **Endpoint**: `GET /api/messages/:conversationId`
- **What happens right now**: Any logged-in user can request the message history of any conversation if they know or guess the `conversationId`.
- **Why it matters**: This is a security and privacy risk. Users should only read chats they belong to.
- **How to fix it**: Verify membership before fetching messages:
  ```javascript
  const isMember = conversation.participants.some(
    (id) => id.toString() === req.user._id.toString(),
  );
  if (!isMember) {
    return res
      .status(403)
      .json({ error: "You do not have access to this conversation." });
  }
  ```

---

### 3.2 Block empty and whitespace-only messages

- **Endpoint**: `POST /api/messages`
- **What happens right now**: The backend allows sending empty spaces `"   "`, creating blank message bubbles in the database.
- **Why it matters**: Clutters chat history and wastes database storage.
- **How to fix it**: Validate `text.trim()` before saving:
  ```javascript
  const trimmed = req.body.text?.trim();
  if (!trimmed) {
    return res.status(400).json({ error: "Message text cannot be empty." });
  }
  ```

---

### 3.3 Keep the `sender` format consistent across all message endpoints

- **Endpoints**: `GET /api/messages/:conversationId` and `POST /api/messages`
- **What happens right now**: In some responses, `sender` is a full object `{ _id, name, phone }`, but in other responses, it is just a plain string ID `"65a4e..."`.
- **Why it matters**: The frontend has to write double type-guards everywhere (`typeof msg.sender === 'string' ? ... : msg.sender.name`) to prevent crashes.
- **How to fix it**: Standardize on one format across the entire backend. Always return `sender` as `{ _id, name, phone }`.

---

## 4. Group Management & Admin Permissions

### 4.1 Check admin permissions for group changes

- **Endpoints**:
  - `POST /api/conversations/:id/participants` (Add members)
  - `DELETE /api/conversations/:id/participants/:userId` (Remove members)
  - `PATCH /api/conversations/:id/name` (Rename group)
- **What happens right now**: Any group member can sometimes trigger administrative actions without being an admin.
- **Why it matters**: Regular participants can accidentally kick out other users or rename groups.
- **How to fix it**: Add an admin check helper in your middleware or controller:
  ```javascript
  const isAdmin = conversation.admins.some(
    (adminId) => adminId.toString() === req.user._id.toString(),
  );
  if (!isAdmin) {
    return res
      .status(403)
      .json({ error: "Only group admins can perform this action." });
  }
  ```

---

### 4.2 Auto-promote another member when the last admin leaves

- **Endpoint**: `DELETE /api/conversations/:id/participants/:userId`
- **What happens right now**: If the only admin leaves the group, the group is left with 0 admins. No one can ever add members or manage the group again.
- **Why it matters**: The group becomes permanently orphaned.
- **How to fix it**: When an admin leaves, check if any admins remain. If not, automatically promote the oldest remaining member to admin:
  ```javascript
  if (
    conversation.admins.length === 0 &&
    conversation.participants.length > 0
  ) {
    conversation.admins.push(conversation.participants[0]);
  }
  ```

---

### 4.3 Remove users from the active socket room when they are removed

- **Endpoint**: `DELETE /api/conversations/:id/participants/:userId`
- **What happens right now**: When User B is removed from a group, their active WebSocket connection stays in the room and continues receiving live messages until they refresh their browser.
- **Why it matters**: Privacy issue—removed members can still see messages being sent in real time.
- **How to fix it**: In the Socket.io server, find the socket for the removed user and call `socket.leave(conversationId)`.

---

## 5. WebSocket & Real-Time Sync

### 5.1 Relay `typing` events to everyone in the room

- **Event**: `typing` and `typing:stop`
- **What happens right now**: The frontend emits typing socket events, but the backend Socket.io server does not relay them to the other participants in the room.
- **Why it matters**: The typing indicator ("Alex is typing...") never shows up for the other person over WebSockets.
- **How to fix it**: Add a basic room relay handler in `socket.js`:
  ```javascript
  socket.on("typing", ({ conversationId, isTyping }) => {
    // Send to everyone in the conversation room except the sender
    socket.to(conversationId).emit("typing", {
      conversationId,
      userId: socket.userId,
      userName: socket.userName,
      isTyping: Boolean(isTyping),
    });
  });
  ```

---

### 5.2 Broadcast user profile changes (`user:updated`)

- **Event**: `user:updated`
- **What happens right now**: When a user changes their name, other people chatting with them still see the old name until they hard refresh the page.
- **Why it matters**: Names become out-of-sync across active chat sessions.
- **How to fix it**: When a user updates their name on the server, broadcast a quick event:
  ```javascript
  io.emit("user:updated", {
    userId: updatedUser._id,
    name: updatedUser.name,
    phone: updatedUser.phone,
  });
  ```

---

### 5.3 Automatically join conversation rooms on connection

- **Event**: `connection`
- **What happens right now**: Socket clients must manually emit join events for every single room, which can fail if connections drop and reconnect.
- **Why it matters**: Reconnected users sometimes miss incoming group messages.
- **How to fix it**: When a socket authenticates on connection, look up their conversation IDs from the database and auto-join those rooms:
  ```javascript
  const userConversations = await Conversation.find({
    participants: socket.userId,
  });
  userConversations.forEach((conv) => socket.join(conv._id.toString()));
  ```

---

## 6. Consistent Error Formats & Timestamps

### 6.1 Standardize error response bodies

- **What happens right now**: Some endpoints return `{ message: "..." }`, others return `{ error: "..." }`, and some return `{ error: { message: "..." } }`.
- **Why it matters**: The frontend has to write messy catch blocks to extract error text.
- **How to fix it**: Always return a uniform error object:
  ```json
  {
    "success": false,
    "error": "Human-readable explanation of what went wrong"
  }
  ```

---

### 6.2 Use standard ISO 8601 UTC timestamps everywhere

- **What happens right now**: Some timestamps are returned as Unix numbers (`1724240000000`), while others are ISO strings (`"2026-08-21T13:30:00.000Z"`).
- **Why it matters**: Inconsistent date parsing leads to `NaN` or incorrect relative time displays (e.g. "54 years ago").
- **How to fix it**: Ensure all `createdAt` and `updatedAt` fields are formatted as standard ISO strings via Mongoose `.toISOString()`.

---

## 7. Priority Summary Table

| Priority   | Feature / Endpoint               | Problem                                     | Easy Fix                                             |
| :--------- | :------------------------------- | :------------------------------------------ | :--------------------------------------------------- |
| **High**   | `GET /api/users/search`          | Searching with `+` crashes the server       | Escape regex characters in the query                 |
| **High**   | `POST /api/conversations/group`  | `lastMessage` is `undefined` on new groups  | Set `lastMessage: null` explicitly                   |
| **High**   | `POST /api/messages`             | Allows saving empty/whitespace messages     | Reject with `400` if `text.trim()` is empty          |
| **High**   | `GET /api/messages/:id`          | No membership check (security issue)        | Return `403` if user is not in `participants`        |
| **High**   | WebSocket `typing`               | Typing events are ignored by server         | Relay `typing` events to `socket.to(conversationId)` |
| **Medium** | `POST /api/auth/login`           | Multiple formats create duplicate users     | Clean phone numbers to standard format               |
| **Medium** | `POST /api/conversations/direct` | Allows direct chat with oneself             | Return `400` if `userId === req.user._id`            |
| **Medium** | `GET /api/conversations`         | Missing unread counts per conversation      | Calculate and return `unreadCount: number`           |
| **Medium** | Group Member Removal             | Groups lose all admins if sole admin leaves | Auto-promote oldest remaining member to admin        |
| **Low**    | Message Payloads                 | Mixed `sender` types (string vs object)     | Always populate `sender: { _id, name, phone }`       |

---

_Let me know if you want to walk through any of these together or need sample test payloads!_
