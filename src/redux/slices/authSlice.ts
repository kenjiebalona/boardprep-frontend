import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

interface Token {
  id: string;
  type: string;
  exp: number;
  iat: number;
}

interface AuthState {
  isAuth: boolean;
  isLoading: boolean;
  error: string | null;
  token: Token;
  pathname: string;
}

const initialState: AuthState = {
  isAuth: false,
  isLoading: false,
  error: null,
  token: {
    id: "",
    type: "",
    exp: 0,
    iat: 0,
  },
  pathname: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserFromLocalStorage: (state) => {
      const token = localStorage.getItem("token");
      if (token) {
        state.isAuth = true;
        const parts = token.split(".");

        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            state.token = payload;
          } catch (error) {
            console.error("Error decoding JWT:", error);
            throw new Error("Invalid JWT format");
          }
        } else {
          console.error("Invalid JWT format");
          throw new Error("Invalid JWT format");
        }
      }
    },
    signOut: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("mocktestStartTime");
      state.isAuth = false;
      state.token = {
        id: "",
        type: "",
        exp: 0,
        iat: 0,
      };
    },
    setPathname: (state, action: PayloadAction<string>) => {
      state.pathname = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signIn.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(signIn.fulfilled, (state, action: PayloadAction<any>) => {
      state.isAuth = true;
      state.isLoading = false;
      state.token = action.payload;
    });
    builder.addCase(signIn.rejected, (state, action: PayloadAction<any>) => {
      state.isAuth = false;
      state.isLoading = false;
      state.error = action.payload;
    });
    builder.addCase(signUp.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(signUp.fulfilled, (state, action: PayloadAction<any>) => {
      state.isAuth = true;
      state.isLoading = false;
      state.token = action.payload;
    });
    builder.addCase(signUp.rejected, (state, action: PayloadAction<any>) => {
      state.isAuth = false;
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export const signIn = createAsyncThunk(
  "auth/signIn",
  async ({ username, password }: { username: string; password: string }) => {
    try {
      const response = await axiosInstance.post("/login/user/", {
        username: username,
        password: password,
      });
      const token = response.data.jwt;
      localStorage.setItem("token", token);

      if (token) {
        const parts = token.split(".");

        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            return payload;
          } catch (error) {
            console.error("Error decoding JWT:", error);
            throw new Error("Invalid JWT format");
          }
        } else {
          console.error("Invalid JWT format");
          throw new Error("Invalid JWT format");
        }
      } else {
        console.error("JWT token not found");
        throw new Error("JWT token not found");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      throw error;
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signUp",
  async ({
    username,
    password,
    firstname,
    lastname,
    email,
    specialization,
    userType,
  }: {
    username: string;
    password: string;
    email: string;
    userType: string;
    firstname: string;
    lastname: string;
    specialization: string;
  }) => {
    try {
      const response = await axiosInstance.post(`/register/${userType}/`, {
        user_name: username,
        password: password,
        email: email,
        first_name: firstname,
        last_name: lastname,
        specialization,
      });
      const token = response.data.jwt;
      localStorage.setItem("token", token);

      if (token) {
        const parts = token.split(".");

        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            return payload;
          } catch (error) {
            console.error("Error decoding JWT:", error);
            throw new Error("Invalid JWT format");
          }
        } else {
          console.error("Invalid JWT format");
          throw new Error("Invalid JWT format");
        }
      } else {
        console.error("JWT token not found");
        throw new Error("JWT token not found");
      }
    } catch (error) {
      console.error("Error during sign-up:", error);
      throw error;
    }
  }
);

export const { setUserFromLocalStorage, signOut, setPathname } =
  authSlice.actions;

export const selectUser = (state: { auth: AuthState }) => state.auth;

export default authSlice.reducer;
