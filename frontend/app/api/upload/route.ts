import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({
                success: false,
                error: 'No file provided'
            }, { status: 400 });
        }

        const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': process.env.PINATA_API_KEY!,
                'pinata_secret_api_key': process.env.PINATA_API_SECRET!,
            },
            body: formData,
        });

        if (!pinataResponse.ok) {
            const errorData = await pinataResponse.json();
            throw new Error(errorData.error || 'Pinata upload failed');
        }

        const data = await pinataResponse.json();

        return NextResponse.json({
            success: true,
            ipfsHash: data.IpfsHash,
        });

    } catch (error) {
        console.error('Pinata upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Upload failed' },
            { status: 500 }
        );
    }
}
