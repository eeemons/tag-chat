import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { chatApi } from "@/lib/api";
import type { User } from "@/lib/types";

const TOKEN_KEY = "tag-chat-token";

type AuthState = {
  token: string | null;
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "error";
  restoring: boolean;
  error: string | null;
};

const initialState: AuthState = {
  token: null,
  user: null,
  status: "idle",
  restoring: true,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { phone: string; name: string }) => {
    return chatApi.login(payload.phone, payload.name);
  },
);

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    const token =
      typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return rejectWithValue("No saved session");
    }

    try {
      const user = await chatApi.me(token);
      return { token, user };
    } catch {
      window.localStorage.removeItem(TOKEN_KEY);
      return rejectWithValue("Session expired");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      state.restoring = false;
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
        state.restoring = false;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(TOKEN_KEY, action.payload.token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Unable to log in";
        state.restoring = false;
      })
      .addCase(restoreSession.pending, (state) => {
        state.restoring = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.status = "authenticated";
        state.restoring = false;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.status = "idle";
        state.restoring = false;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
