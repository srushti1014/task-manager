import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET a single task
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const task = await prisma.task.findFirst({
      where: { id: id, userId: session.user.id },
      include: { 
        taskCategories: { 
          include: { category: true },
          where: { userId: session.user.id }
        }, 
        taskTags: { 
          include: { tag: true },
          where: { userId: session.user.id }
        } 
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// UPDATE task
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      dueDate,
      priority,
      status,
      categoryId,
      tagIds,
    } = body;

    // First, verify the *TASK* belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: { id: id, userId: session.user.id },
    });
    if (!existingTask) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    // Verify the *TAGS* belongs to the user
    let validTagIds: string[] = [];
    if (tagIds && tagIds.length > 0) {
      const validTags = await prisma.tag.findMany({
        where: {
          id: { in: tagIds },
          userId: session.user.id,
        },
        select: { id: true },
      });
      validTagIds = validTags.map((tag) => tag.id);
    }

    // A transaction = group of queries that run all are none...
    const updatedTask = await prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: id },
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority,
          status,
          categoryId: categoryId || null,
        },
      });

      // Handle tags - first remove existing relationships
      await tx.taskTag.deleteMany({
        where: { taskId: id },
      });

      // Then create new relationships with validated tags
      if (validTagIds.length > 0) {
        await tx.taskTag.createMany({
          data: validTagIds.map((tagId: string) => ({
            taskId: id,
            tagId,
            userId: session.user.id
          })),
        });
      }

      // Fetch the complete updated task with relationships
      return tx.task.findUnique({
        where: { id: id },
        include: {
          taskCategories: {
            include: {
              category: true,
            },
          },
          taskTags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.taskTag.deleteMany({
        where: { taskId: id },
      });

      await tx.task.delete({
        where: { id: id },
      });
    });

    return NextResponse.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
