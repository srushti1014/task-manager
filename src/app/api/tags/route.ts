import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET all tags
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const tags = await prisma.tag.findMany({
      where: { userId: session.user.id },
      include: {
        tasks: {
          include: {
            task: true, 
          },
        },
      },
    });

    const formattedTags = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      createdAt: tag.createdAt?.toISOString().split("T")[0] || "", 
      taskCount: tag.tasks.length,
      completedTasks: tag.tasks.filter((task) => task.task.status === "COMPLETED")
        .length,
      pendingTasks: tag.tasks.filter((task) => task.task.status === "PENDING").length 
    }));

    return NextResponse.json({ success: true, data: formattedTags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// CREATE tag
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const body = await req.json();
    const { name, color } = body;

    const existing = await prisma.tag.findFirst({
      where: { name, userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Tag already exists" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: tag }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: `An unexpected error occurred: ${err.message}`,
      },
      { status: 500 }
    );
  }
}
