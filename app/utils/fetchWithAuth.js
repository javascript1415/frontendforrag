import { useRouter } from "next/navigation";

export async function fetchWithAuth(url, options = {}) {
  const router = useRouter();

  try {
    let response = await fetch(url, {
      ...options,
      credentials: "include",
    });

    // If 401, try to refresh token
    if (response.status === 401) {
      const refreshRes = await fetch(
        "http://localhost:8001/api/v1/users/refresh-token",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (refreshRes.ok) {
        // Retry original request
        response = await fetch(url, {
          ...options,
          credentials: "include",
        });
      } else {
        // Redirect to login if refresh fails
        router.push("/login");
        throw new Error("Session expired. Please log in again.");
      }
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}
