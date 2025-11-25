import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received background removal request')

    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      console.error('❌ No image provided')
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    console.log(`📸 Processing image: ${image.name} (${image.size} bytes, ${image.type})`)

    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('❌ Replicate API token not configured')
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      )
    }

    // Convert image to base64 data URL
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`

    console.log(`✅ Image converted to base64 (${base64Image.length} chars)`)

    // Initialize Replicate
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    console.log('🚀 Starting Replicate prediction...')

    // Create prediction with async approach
    let prediction = await replicate.predictions.create({
      version: '1a075954106b608c3671c2583e10526216f700d846b127fcf01461e8f642fb48',
      input: {
        image: base64Image,
      },
    })

    console.log(`⏳ Prediction created: ${prediction.id}, status: ${prediction.status}`)

    // Poll for completion (max 60 seconds)
    const maxAttempts = 60
    let attempts = 0

    while (
      prediction.status !== 'succeeded' &&
      prediction.status !== 'failed' &&
      prediction.status !== 'canceled' &&
      attempts < maxAttempts
    ) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      prediction = await replicate.predictions.get(prediction.id)
      attempts++

      if (attempts % 5 === 0) {
        console.log(`⏳ Still processing... (${attempts}s) status: ${prediction.status}`)
      }
    }

    if (prediction.status === 'succeeded') {
      console.log('✅ Prediction succeeded!')
      return NextResponse.json({ output: prediction.output })
    } else if (prediction.status === 'failed') {
      console.error('❌ Prediction failed:', prediction.error)
      return NextResponse.json(
        { error: `Prediction failed: ${prediction.error}` },
        { status: 500 }
      )
    } else {
      console.error('⏱️ Prediction timed out')
      return NextResponse.json(
        { error: 'Processing timed out. Please try again.' },
        { status: 408 }
      )
    }
  } catch (error) {
    console.error('❌ Error processing image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process image' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
