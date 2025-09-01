import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET tag by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
     const { id } = await context.params;
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const tag = await prisma.tag.findFirst({
      where: { id: id, userId: session.user.id },
      include: { tasks: true },
    });

    if (!tag)
      return NextResponse.json(
        { success: false, message: "Tag not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: tag });
  } catch (error) {
    console.error("Error fetching tag:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// UPDATE tag
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
     const { id } = await context.params;
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const body = await req.json();
    const { name, color } = body;

    // Check if another tag with the same name exists for this user
    const existing = await prisma.tag.findFirst({
      where: { 
        name, 
        userId: session.user.id, 
        NOT: { id: id }  // exclude current tag
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Tag with same name already exist." },
        { status: 400 }
      );
    }

    const updatedTag = await prisma.tag.update({
      where: { id: id },
      data: { name, color },
    });

    return NextResponse.json({ success: true, data: updatedTag });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: `An unexpected error occurred: ${err.message}` },
      { status: 500 }
    );
  }
}

// DELETE tag

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
     const { id } = await context.params;
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    // Check if tag belongs to user
    const tag = await prisma.tag.findFirst({
      where: { id: id, userId: session.user.id },
    });

    if (!tag)
      return NextResponse.json(
        { success: false, message: "Tag not found" },
        { status: 404 }
      );

    // Delete tag
    await prisma.tag.delete({ where: { id: id } });

    return NextResponse.json({ success: true, message: "Tag deleted" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
