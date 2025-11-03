"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:8001/api/v1/users/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    window.scrollTo(0, 0);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="overflow-y-hidden">
        <div className="min-h-screen w-full flex flex-col md:flex-row p-4">
          <div className="flex-1 basis-full md:basis-1/3 min-w-0 min-h-[40vh] md:min-h-screen p-2 flex justify-center items-center">
            <FileUploadComponent />
          </div>
          <div className="flex-1 basis-full md:basis-2/3 min-w-0 min-h-[60vh] md:min-h-screen border-t-2 md:border-t-0 md:border-l-2 border-gray-200 p-2">
            <ChatComponent />
          </div>
        </div>
      </div>
    </>
  );
}
