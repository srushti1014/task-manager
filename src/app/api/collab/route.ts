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
      // include: {
      //   user: true,
      //   taskCategories: { include: { category: true } },
      //   taskTags: { include: { tag: true } },
      //   collaborators: { include: { user: true } },
      // },
      include: {
        user: true,
        taskCategories: {
          include: { category: true },
          where: { userId: session.user.id },
        },
        taskTags: {
          include: { tag: true },
          where: { userId: session.user.id }, 
        },
        collaborators: { include: { user: true } },
      },
    });

    const tasksWithRole = collabTasks.map((task) => {
      let role: "OWNER" | "VIEWER" = "VIEWER";

      if (task.userId === session.user.id) {
        role = "OWNER"; // creator of the task
      } else {
        const collab = task.collaborators.find(
          (c) => c.userId === session.user.id
        );
        if (collab) {
          role = collab.role as "OWNER" | "VIEWER";
        }
      }

      return {
        ...task,
        currentUserRole: role,
      };
    });

    return NextResponse.json({ success: true, data: tasksWithRole });
  } catch (err) {
    console.error("Error fetching collab tasks:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
