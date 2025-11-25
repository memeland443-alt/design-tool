# Design Tool

AI-powered design tools for professionals. Remove backgrounds, upscale images, and enhance photos using cutting-edge AI models.

## Features

- **Background Removal**: Automatically remove backgrounds from images using Replicate AI
- **Drag & Drop**: Easy file upload with drag-and-drop support
- **Batch Processing**: Process multiple images at once
- **Download Options**: Download individual images or all at once

## Tech Stack

- **Next.js 15** - React framework with App Router
- **shadcn/ui** - Beautiful UI components built on Radix UI
- **Replicate** - AI model API for image processing
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm
- Replicate API token

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

4. Add your Replicate API token to `.env.local`:

```
REPLICATE_API_TOKEN=your_token_here
```

Get your token from [Replicate Account Settings](https://replicate.com/account/api-tokens)

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
design.tool/
├── app/
│   ├── api/
│   │   └── remove-background/
│   │       └── route.ts          # API endpoint for background removal
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page with tabs
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── tabs.tsx
│   └── background-remover.tsx    # Background removal component
├── lib/
│   └── utils.ts                  # Utility functions
├── .env.example                  # Environment variables template
├── components.json               # shadcn/ui configuration
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## Usage

1. Navigate to the "Remove BG" tab
2. Drag and drop images or click to select files
3. Click "Remove Background" to process all images
4. Download individual images or use "Download All"

## Deployment

### Deploy to Vercel

The easiest way to deploy is using Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add your `REPLICATE_API_TOKEN` environment variable
4. Deploy

### Environment Variables

Make sure to set these environment variables in your deployment:

- `REPLICATE_API_TOKEN` - Your Replicate API token

## Future Features

- Image upscaling
- Image enhancement
- More AI-powered tools
- Custom model selection
- Processing history

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
