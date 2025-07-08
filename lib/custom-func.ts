// import function from api-client.ts
import { apiClient } from "./api-client";

export async function verifyAndGetMe() {
  const accessToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="));
  if (!accessToken) {
    throw new Error("No access token found in cookies");
  }
  const token = accessToken.split("=")[1];
  apiClient.setToken(token);

  // get me to get sub
  const user_sub = (await apiClient.getCurrentUser()).sub;
  if (!user_sub) {
    throw new Error("No user sub found");
  }
  // get user by sub
  const user = await apiClient.getUser(user_sub);
  if (!user) {
    throw new Error("No user found with the given sub");
  }
  return user;
}

export async function logout() {
  try {
    // remove access token from cookies
    document.cookie = "";
  } catch (error) {
    console.error("Logout failed:", error);
    throw new Error("Logout failed");
  }
}
