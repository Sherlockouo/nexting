"use client";
import { useEffect, useState } from "react";

import RssReader from "@/components/RssReader";
import { GitHubRepoItem } from "@/types/rss";

export default function TrendingPage() {
  const [feedItems, setFeedItems] = useState<GitHubRepoItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 改为调用本地 API 路由
        const response = await fetch("/api/rss/github");
        const data = await response.json();

        setFeedItems(data);
      } catch (error) {
        console.error("Failed to fetch:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <RssReader feedItems={feedItems} />
    </div>
  );
}
