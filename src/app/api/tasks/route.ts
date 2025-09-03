/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    //  Filters
    const status = searchParams.get("status"); // pending | completed | in-progress
    const priority = searchParams.get("priority"); // low | medium | high
    const categoryId = searchParams.get("categoryId");
    const tags = searchParams.get("tags")?.split(","); // ["tag1","tag2"]
    const search = searchParams.get("search") || "";
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    //  Sorting + Pagination
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000");
    const skip = (page - 1) * limit;

    //  Where condition
    const where: any = { userId: session.user.id };

    if (status && status !== "all") where.status = status;
    if (priority && priority !== "all") where.priority = priority;
    // if (categoryId && categoryId !== "all") where.categoryId = categoryId;

    if (categoryId && categoryId !== "all") {
      where.taskCategories = {
        some: {
          categoryId,
          userId: session.user.id,
        },
      };
    }

    if (tags && tags.length > 0) {
      where.taskTags = {
        some: {
          tag: {
            name: { in: tags },
          },
          userId: session.user.id,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (fromDate || toDate) {
      where.dueDate = {};
      if (fromDate) where.dueDate.gte = new Date(fromDate);
      if (toDate) where.dueDate.lte = new Date(toDate);
    }

    //  Query DB
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        // include: {
        //   taskCategories : { include: { category: true } },
        //   taskTags: { include: { tag: true } },
        // },
        include: {
          taskCategories: {
            include: { category: true },
            where: { userId: session.user.id },
          },
          taskTags: {
            include: { tag: true },
            where: { userId: session.user.id },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
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
        taskTags: tagIds
          ? {
              create: tagIds.map((tagId: string) => ({
                tagId,
                userId: session.user.id,
              })),
            }
          : undefined,
        taskCategories: categoryId
          ? {
              create: {
                categoryId,
                userId: session.user.id,
              },
            }
          : undefined,
      },
      include: {
        taskCategories: {
          include: {
            category: true,
          },
        },
        taskTags: {
          include: { tag: true },
        },
      },
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

// GET all tasks for logged-in user
// export async function GET() {
//   try {
//     const session = await auth();
//     if(session?.user.id){
//       console.log("USER ID:", session.user.id);
//     }
//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const tasks = await prisma.task.findMany({
//       where: { userId: session.user.id },
//       include: {
//         category: true,
//         tags: {
//           include: { tag: true },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return NextResponse.json({ success: true, data: tasks });
//   } catch (error) {
//     console.error("Error fetching tasks:", error);
//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 }
//     );
//   }
// }
