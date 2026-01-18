import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const { cid } = await request.json();

        await axios.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
            headers: {
                Authorization: `Bearer ${process.env.PINATA_JWT}`,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Unpin failed' }, { status: 500 });
    }
}