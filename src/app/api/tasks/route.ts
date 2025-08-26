import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET all tasks for logged-in user
export async function GET() {
  try {
    const session = await auth();
    if(session?.user.id){
      console.log("USER ID:", session.user.id);
    }
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      include: {
        category: true,
        tags: {
          include: { tag: true }, 
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// CREATE a task
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
    const { title, description, dueDate, priority, categoryId, tagIds } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        userId: session.user.id,
        categoryId,
        tags: tagIds
          ? {
              create: tagIds.map((tagId: string) => ({
                tag: { connect: { id: tagId } }, //tags here refers to the relation Task → TaskTag[].
              })),
            }
          : undefined,
      },
      include: { category: true, tags: { include: { tag: true } } },
    });

    // taskId is auto-filled with the new Task’s id (because you’re inside task.create).
    // tagId comes from the connect { id: tagId }.

    //connect → links an existing row by its id
    //tag = the relation field inside TaskTag (points to Tag).
    //connect: { id: tagId } = "find the Tag with this id, and link it."

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
