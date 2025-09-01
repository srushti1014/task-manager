import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// GET all categories for logged-in user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      include: { tasks: true },
    });

    const formattedCate = categories.map((cate) => ({
      id: cate.id,
      name: cate.name,
      color: cate.color,
      createdAt: cate.createdAt?.toISOString().split("T")[0] || "", 
      taskCount: cate.tasks.length,
      completedTasks: cate.tasks.filter((task) => task.status === "COMPLETED")
        .length,
      pendingTasks: cate.tasks.filter((task) => task.status === "PENDING").length 
    }));

    return NextResponse.json({ success: true, data: formattedCate });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// CREATE category
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log(body, session.user.id);
    const { name, color } = body;

    const existing = await prisma.category.findFirst({
      where: { name, userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        color,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("POST /categories error:", err);
    return NextResponse.json(
      {
        success: false,
        message: `An unexpected error occurred: ${err.message}`,
      },
      { status: 500 }
    );
  }
}
