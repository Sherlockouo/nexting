import { XMLParser } from "fast-xml-parser";

import { GitHubRepoItem } from "@/types/rss";

export const parseXmlToJson = (xml: string): GitHubRepoItem[] => {
  const parser = new XMLParser();
  const result = parser.parse(xml);

  return result.rss.channel.item.map((item: any) => ({
    title: item.title,
    link: item.link,
    description: item.description,
    guid: item.guid,
    author: item.author,
  }));
};
