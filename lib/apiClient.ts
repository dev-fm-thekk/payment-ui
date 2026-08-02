'use client';

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiOptions extends RequestInit {
  data?: any;
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  let accessToken = localStorage.getItem("accessToken")

  console.log(accessToken);
  const headers = new Headers(options.headers || {});

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (options.data) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.data);
  }


  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });


  console.log(response);
  // If unauthorized, attempt to refresh the token
  if (response.status === 401 || response.status === 403) {
    try {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });


      const data = await refreshResponse.json();


      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
          }

          // Retry original request with new token
          headers.set("Authorization", `Bearer ${data.accessToken}`);
          response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          throw new Error("Refresh failed");
        }
      } else {
        throw new Error("Refresh failed");
      }
    } catch (err) {
      // If refresh fails, clear tokens and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("auth:logout"));
        window.location.href = "/login";
      }
    }
  }

  const contentType = response.headers.get("content-type");
  const data =
    contentType && contentType.includes("application/json")
      ? await response.json()
      : null;

  if (!response.ok) {
    throw {
      status: response.status,
      data,
      message: data?.error || data?.message || "API request failed",
    };
  }

  return data;
}
