import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await context.params;

//     const task = await prisma.task.findUnique({
//       where: { id: id },
//       include: {
//         collaborators: {
//           include: {
//             user: {
//               select: { id: true, email: true, name: true }, // return user details
//             },
//           },
//         },
//       },
//     });

//     if (!task) {
//       return NextResponse.json(
//         { success: false, message: "Task not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       data: task.collaborators,
//     });
//   } catch (err) {
//     console.error("Error fetching collaborators:", err);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch collaborators" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } }, // owner
        collaborators: {
          select: {
            id: true,
            taskId: true,
            userId: true,
            role: true,
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    // Fake TaskUser entry for owner (to match collaborators format)
    const ownerAsCollaborator = {
      id: `owner-${task.user.id}`, // fake id, unique
      taskId: task.id,
      userId: task.user.id,
      role: "OWNER",
      user: task.user,
    };

    const allMembers = [ownerAsCollaborator, ...task.collaborators];

    return NextResponse.json({
      success: true,
      data: allMembers,
    });
  } catch (err) {
    console.error("Error fetching collaborators:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch collaborators" },
      { status: 500 }
    );
  }
}



export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const taskId = params.id;
    const { emails, role } = await req.json();

    // 1. Verify that current user is owner of the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { userId: true },
    });

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Not allowed" },
        { status: 403 }
      );
    }

    // 2. Find users by email
    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { id: true },
    });

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "No users found" },
        { status: 404 }
      );
    }

    // 3. Create TaskUser records
    const collaborators = await prisma.taskUser.createMany({
      data: users.map((u) => ({
        taskId,
        userId: u.id,
        role: role || "EDITOR",
      })),
      skipDuplicates: true, // avoid duplicate rows
    });

    return NextResponse.json({ success: true, collaborators });
  } catch (err) {
    console.error("Error adding collaborators:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

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

    const { email, role } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.taskUser.update({
      where: {
        taskId_userId: { taskId: id, userId: user.id }, // composite unique
      },
      data: { role },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error in updating collaborator.........", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

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

    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    await prisma.taskUser.delete({
      where: {
        taskId_userId: { taskId: id, userId: user.id },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Collaborator removed",
    });
  } catch (err) {
    console.error("Error removing collaborator:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
