"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8001/api/v1/users/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        // Clear any local storage if needed
        localStorage.removeItem("token");
        router.replace("/login");
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-all"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
