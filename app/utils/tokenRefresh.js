export async function refreshAccessToken() {
  try {
    const res = await fetch("http://localhost:8001/api/v1/users/refresh-token", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}
