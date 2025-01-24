import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export async function GET() {
  try {
    // 从原始数据源获取数据
    const apiResponse = await fetch(
      "http://192.168.64.1:1200/github/trending/weekly/any",
    );

    // XML 数据处理
    const xmlText = await apiResponse.text();
    const parser = new XMLParser();
    const result = parser.parse(xmlText);

    // 数据结构转换
    const items = result.rss.channel.item.map((item: any) => ({
      title: item.title,
      link: item.link,
      description: item.description,
      guid: item.guid,
      author: item.author,
      pubDate: item.pubDate,
    }));

    // 返回 JSON 格式数据
    return NextResponse.json(items, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch GitHub trending data" },
      { status: 500 },
    );
  }
}
