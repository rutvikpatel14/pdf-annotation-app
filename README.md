# PDF Annotation App

A local-first PDF annotation tool built with Next.js, React PDF, and Konva.

## Features

- Load and view the first page of a PDF
- Add annotations:
  - Rectangle
  - Circle
  - Line
  - Text
- Select, move, edit, and delete annotations
- Export annotations as JSON
- Import annotations from JSON
- Zoom the PDF canvas

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- `react-pdf`
- `react-konva`
- Radix UI Dialog

## Local Setup

### Prerequisites

- Node.js 18 or newer
- npm

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Lint

```bash
npm run lint
```

### Production Build

```bash
npm run build
npm start
```

## Usage

1. Upload a PDF.
2. Choose an annotation tool from the top toolbar.
3. Click or draw on the page to create annotations.
4. Select annotations to move them or edit them from the right sidebar.
5. Use Export JSON to save annotation data.
6. Use Import to restore annotation data from JSON.

## Notes

- The app renders the first page of the uploaded PDF.
- Annotation import scales coordinates to the current rendered page size.
- PDF.js uses the locally bundled worker, so no CDN access is required for the worker.

## Submission Checklist

- App runs locally with documented setup steps
- Required features are implemented:
  - PDF load/view
  - Shape annotations
  - Text annotations
  - Select / move / delete
- Export works:
  - Annotation JSON export
  - Annotation JSON import
- Linting passes with no errors
- Repository is ready for review
