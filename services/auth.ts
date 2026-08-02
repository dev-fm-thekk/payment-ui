"use server";

import { cookies } from "next/headers";

export type AuthResponse =
  | { success: true; user: any; accessToken: string; refreshToken: string }
  | { success: false; reason: string; status: number };

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const endpoint = "http://localhost:3001/auth/login";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      let reason = "An unknown error occurred during login.";
      try {
        const errorData = await response.json();
        reason = errorData.error || errorData.message || reason;
      } catch (e) {
        if (response.status === 401) reason = "Invalid email or password.";
        else if (response.status === 404) reason = "User not found.";
        else if (response.status >= 500)
          reason = "Server error. Please try again later.";
      }
      return {
        success: false,
        status: response.status,
        reason,
      };
    }

    const data = await response.json();

    if (data.status === "failed") {
      return {
        success: false,
        status: 400,
        reason: data.error || "Login failed due to an unknown reason.",
      };
    }

    const setCookie = response.headers.get("set-cookie");

    if (setCookie) {
      // Parse the cookie or extract the token and set it
      (await cookies()).set("refreshToken", data.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
    return {
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      reason: "Network error or server is unreachable.",
    };
  }
};
