import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { sections } = body;

    console.log("🔄 Reorder API called with sections:", sections);

    // For now, just return success
    // In a real implementation, you would update the database with the new order
    return NextResponse.json(
      {
        success: true,
        message: "Sections reordered successfully",
        sections: sections,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Reorder API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reorder sections",
      },
      { status: 500 }
    );
  }
}
