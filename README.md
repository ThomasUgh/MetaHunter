# MetaHunter

<div align="center">

![MetaHunter Logo](public/favicon.svg)

**File Metadata Extraction Tool**

Extract hidden metadata from images, documents, audio, and video files.

[![Version](https://img.shields.io/badge/version-1.0.0-cyan.svg)](https://github.com/yourusername/MetaHunter)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

---

## Features

- 🖼️ **Images** - EXIF data, GPS coordinates, camera info (JPEG, PNG, TIFF, WebP, HEIC)
- 📄 **PDF** - Author, creation dates, page count, producer
- 📝 **Office** - DOCX, XLSX, PPTX metadata and statistics
- 🎵 **Audio** - ID3 tags, album art, codec info (MP3, FLAC, WAV, M4A)
- 🎬 **Video** - Container metadata (MP4, MKV, AVI, MOV)
- 🗺️ **GPS Map** - Interactive map visualization for geotagged images
- 📦 **Batch Processing** - Process multiple files at once
- 💾 **Export** - JSON, CSV, TXT formats
- 🌍 **Multi-Language** - English & German

## Screenshots

![MetaHunter Screenshot](docs/screenshot.png)

## Installation

### Web Version (No Installation)

```bash
# Clone the repository
git clone https://github.com/yourusername/MetaHunter.git
cd MetaHunter

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Desktop App (Electron)

```bash
# Build for your platform
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

Executables will be in the `release/` folder.

## Usage

1. **Drag & Drop** files onto the upload area, or click to browse
2. View extracted metadata organized by category
3. For images with GPS data, see the location on an interactive map
4. **Export** results as JSON, CSV, or TXT
5. Process **multiple files** for batch analysis

## Supported Formats

| Category | Formats |
|----------|---------|
| Images | JPEG, PNG, TIFF, WebP, HEIC, GIF, BMP, RAW (CR2, NEF, ARW) |
| Documents | PDF, DOCX, XLSX, PPTX |
| Audio | MP3, FLAC, WAV, OGG, M4A, AAC, WMA |
| Video | MP4, MKV, AVI, MOV, WebM |

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4
- **Metadata:** exifr, pdf-lib, JSZip, music-metadata
- **Maps:** Leaflet, React-Leaflet
- **Desktop:** Electron

## Privacy

All processing happens **locally in your browser**. No files are uploaded to any server.

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run Electron in dev mode
npm run electron:dev
```

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
Made with ❤️ for the security community
</div>
