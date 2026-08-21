# API Improvement Suggestions

These suggestions are based on live API testing performed on 2026-08-21 while preparing `api_documentation.md`.

## 1. Move Health Under The REST Base Or Document The Root Path

Observed behavior:

- `GET https://frontend-task-chatapp.onrender.com/health` returns `200 OK`.
- `GET https://frontend-task-chatapp.onrender.com/api/health` returns `404 NOT_FOUND`.

Suggestion:

- Either expose `GET /api/health`, or make the root `/health` path explicit in the public docs.

Why it helps:

- Keeps diagnostics predictable for frontend and deployment checks.

## 2. Escape Search Input Before Building Regex Queries

Observed behavior:

- `GET /users/search?q=+880...` returned `500 Internal Server Error`.
- Error message: `Regular expression is invalid: quantifier does not follow a repeatable item`.

Suggestion:

- Escape user-provided search text before constructing regex queries.
- Return a controlled `400` only if the query is actually invalid.

Why it helps:

- Phone numbers commonly begin with `+`.
- Search should not expose server regex internals or fail with `500` for normal user input.

## 3. Enforce Non-Empty Message Text On The API

Observed behavior:

- `POST /messages` accepted whitespace-only text and persisted it.

Suggestion:

- Trim `text` server-side.
- Reject empty or whitespace-only text with a validation error such as `400 Bad Request`.

Why it helps:

- The assignment requires empty messages not to be sendable.
- Server validation protects every client, not only this frontend.

## 4. Standardize Response Envelopes

Observed behavior:

- `GET /conversations` returns `{ data: [...] }`.
- `GET /conversations/{id}/messages` returns `{ messages, hasMore }`.
- Most mutation endpoints return the entity directly.
- Auth login returns `{ token, user }`.

Suggestion:

- Use a consistent envelope, for example `{ data, meta, error }`, across endpoints.

Why it helps:

- Simplifies client API handling, error handling, and TypeScript types.

## 5. Include Full Conversation Shape After Direct Creation

Observed behavior:

- `POST /conversations` returns only `_id`, `participants`, and `createdAt`.
- `GET /conversations` returns richer direct conversation items with `type`, `participant`, `lastMessage`, and `updatedAt`.

Suggestion:

- Return the same conversation shape from `POST /conversations` that appears in `GET /conversations`.

Why it helps:

- Avoids an immediate refetch after creating or opening a direct conversation.

## 6. Clarify Message Pagination Cursor Semantics

Observed behavior:

- A request with `before=<messageId>` returned the same single message in a one-message conversation.

Suggestion:

- Define whether `before` is exclusive or inclusive.
- Prefer exclusive `before`, where the message with the cursor ID is not included again.
- Include a `nextCursor` value when `hasMore` is true.

Why it helps:

- Prevents duplicate messages during infinite scroll and simplifies scroll restoration.

## 7. Return Consistent Error Codes For Authorization And Validation

Observed behavior:

- Missing auth returned `400 NO_TOKEN`.
- Invalid auth returned `401 INVALID_TOKEN`.
- Search regex failure returned `500` with a database/regex-specific message.

Suggestion:

- Use `401` for missing or invalid authentication.
- Use `403` for authenticated users without permission.
- Use `400` or `422` for validation errors.
- Hide database/regex implementation details from client-facing error messages.

Why it helps:

- Makes frontend error states easier to map and safer to display.

## 8. Add Explicit Socket Event Payload Documentation

Observed behavior:

- Socket event names are available, but exact `message:new` and `conversation:updated` payloads still need verification.

Suggestion:

- Document event payload schemas, acknowledgement callback shapes, and common error events.

Why it helps:

- Real-time behavior is central to the assignment, and typed event contracts reduce duplicate-message and stale-list bugs.

## 9. Add Group Validation Rules To The API Contract

Observed behavior:

- Group endpoints return useful updated group entities, but validation rules still need clearer contract coverage.

Suggestion:

- Document and enforce:
  - Minimum participant count.
  - Unique participant IDs.
  - Admin-only mutation rules.
  - Behavior when removing the last admin.
  - Behavior when promoting an existing admin.

Why it helps:

- Helps the frontend prevent invalid actions and handle server rejections cleanly.

## 10. Keep REST And Realtime Conversation Shapes Consistent

Observed behavior:

- Group mutation endpoints return updated group objects.

Suggestion:

- Keep returning the updated object, and ensure the same shape is emitted through realtime `conversation:updated`.

Why it helps:

- Lets the frontend use one normalization path for REST and Socket.io updates.

