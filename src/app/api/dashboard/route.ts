'use server'
import { NextResponse } from "next/server";
import { getDashboardStats } from "@/app/api/dashboard/dashboardActions"; 

export async function GET() {
  try {
    const data = await getDashboardStats();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
