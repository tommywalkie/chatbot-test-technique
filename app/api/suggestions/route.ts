import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [options, locations, items] = await Promise.all([
      prisma.option.findMany({
        select: {
          name: true,
          description: true,
        },
      }),
      prisma.location.findMany({
        select: {
          name: true,
          type: true,
        },
      }),
      prisma.item.findMany({
        select: {
          name: true,
          category: true,
        },
      }),
    ]);

    const suggestions = [
      ...options.map((opt) => ({
        name: opt.name,
        description: opt.description,
        category: "option",
      })),
      ...locations.map((loc) => ({
        name: loc.name,
        description: loc.type,
        category: "location",
      })),
      ...items.map((item) => ({
        name: item.name,
        description: item.category,
        category: "item",
      })),
    ];

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Failed to fetch suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
