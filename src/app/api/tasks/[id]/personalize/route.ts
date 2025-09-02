import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Fetch current user's personalization (tags/categories) for a collab task
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

    // Ensure user has access to this task: owner or collaborator
    const access = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } },
        ],
      },
      select: { id: true },
    });

    if (!access) {
      return NextResponse.json(
        { success: false, message: "Not allowed" },
        { status: 403 }
      );
    }

    const [taskTags, taskCategories] = await Promise.all([
      prisma.taskTag.findMany({
        where: { taskId: id, userId: session.user.id },
        include: { tag: true },
      }),
      prisma.taskCategory.findMany({
        where: { taskId: id, userId: session.user.id },
        include: { category: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tagIds: taskTags.map((t) => t.tagId),
        categoryIds: taskCategories.map((c) => c.categoryId),
        taskTags,
        taskCategories,
      },
    });
  } catch (error) {
    console.error("GET personalize error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// Set current user's personalization for this task
export async function POST(
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

    const { tagIds, categoryId } = await req.json();

    // Ensure user has access to this task: owner or collaborator
    const access = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } },
        ],
      },
      select: { id: true },
    });

    if (!access) {
      return NextResponse.json(
        { success: false, message: "Not allowed" },
        { status: 403 }
      );
    }

    // Validate provided tags/categories belong to this user
    let validTagIds: string[] = [];
    if (Array.isArray(tagIds) && tagIds.length > 0) {
      const validTags = await prisma.tag.findMany({
        where: { id: { in: tagIds }, userId: session.user.id },
        select: { id: true },
      });
      validTagIds = validTags.map((t) => t.id);
    }

    let validCategoryId: string | null = null;
    if (categoryId && categoryId !== "none") {
      const cate = await prisma.category.findFirst({
        where: { id: categoryId, userId: session.user.id },
        select: { id: true },
      });
      validCategoryId = cate?.id ?? null;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Reset user's tags on this task
      await tx.taskTag.deleteMany({ where: { taskId: id, userId: session.user.id } });
      if (validTagIds.length > 0) {
        await tx.taskTag.createMany({
          data: validTagIds.map((tagId: string) => ({
            taskId: id,
            tagId,
            userId: session.user.id,
          })),
        });
      }

      // Reset user's categories on this task
      await tx.taskCategory.deleteMany({ where: { taskId: id, userId: session.user.id } });
      if (validCategoryId) {
        await tx.taskCategory.create({
          data: {
            taskId: id,
            categoryId: validCategoryId,
            userId: session.user.id,
          },
        });
      }

      return tx.task.findUnique({
        where: { id },
        include: {
          taskTags: { where: { userId: session.user.id }, include: { tag: true } },
          taskCategories: { where: { userId: session.user.id }, include: { category: true } },
        },
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("POST personalize error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}


