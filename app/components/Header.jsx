"use client"
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-blue-600">EmmVision</h1>
      </div>
      <nav className="flex items-center gap-6">
        <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Home
        </Link>
        <Link href="/create-company" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Create Company
        </Link>
        <Link href="/companyadminemail" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Admin Email
        </Link>
        <LogoutButton />
      </nav>
    </header>
  );
}
