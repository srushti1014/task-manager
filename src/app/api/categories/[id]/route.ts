import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET single category
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
  
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const category = await prisma.category.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: { tasks: true },
    });

    if (!category)
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// UPDATE category
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { name, color } = await req.json();

    // Check ownership
    const category = await prisma.category.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!category)
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });

    // Check for duplicate name (excluding current category)
    const existing = await prisma.category.findFirst({
      where: { name, userId: session.user.id, NOT: { id: params.id } },
    });
    if (existing)
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });

    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: { name, color },
    });

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: `An unexpected error occurred: ${err.message}` },
      { status: 500 }
    );
  }
}


// DELETE category
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    // Check ownership
    const category = await prisma.category.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!category)
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });

    // Delete category
    await prisma.category.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("DELETE /categories/:id error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

