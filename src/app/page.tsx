"use client";

import dynamic from "next/dynamic";

const ChatInterface = dynamic(() => import("@/components/ChatInterface"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gray-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading PayAgent...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main>
      <ChatInterface />
    </main>
  );
}
