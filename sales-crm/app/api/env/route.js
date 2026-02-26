import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        sqlite_path: process.env.SQLITE_PATH || 'sales_crm.db',
        cwd: process.cwd()
    });
}
