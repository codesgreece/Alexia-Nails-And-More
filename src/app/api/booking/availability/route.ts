import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const staffId = searchParams.get("staffId");
  const date = searchParams.get("date");

  if (!serviceId || !staffId || !date) {
    return NextResponse.json(
      { error: "Απαιτούνται serviceId, staffId και date." },
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Μη έγκυρη ημερομηνία." }, { status: 400 });
  }

  const slots = await getAvailableSlots({ serviceId, staffId, date });
  return NextResponse.json({ slots });
}
