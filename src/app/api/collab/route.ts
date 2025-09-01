import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const collabTasks = await prisma.task.findMany({
      where: {
        // OR: [
        //   { collaborators: { some: { userId: session.user.id } } },
        // ],
        OR: [
          // tasks where I'm explicitly a collaborator
          { collaborators: { some: { userId: session.user.id } } },

          // tasks I own but only if I already added collaborators
          {
            AND: [
              { userId: session.user.id },
              { collaborators: { some: {} } }, // means: has at least one collaborator
            ],
          },
        ],
      },
      include: {
        user: true,
        taskCategories: { include: { category: true } },
        taskTags: { include: { tag: true } },
        collaborators: { include: { user: true } },
      },
    });

    return NextResponse.json({ success: true, data: collabTasks });
  } catch (err) {
    console.error("Error fetching collab tasks:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
