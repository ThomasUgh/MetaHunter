import exifr from 'exifr'
import { PDFDocument } from 'pdf-lib'

export async function extractMetadata(file) {
  const type = file.type
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (type.startsWith('image/')) {
    return extractImageMetadata(file)
  }

  if (type === 'application/pdf' || ext === 'pdf') {
    return extractPdfMetadata(file)
  }

  // fallback - just basic info
  return { 
    fileInfo: {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      lastModified: new Date(file.lastModified)
    },
    note: 'File type not fully supported yet'
  }
}

async function extractPdfMetadata(file) {
  const basicInfo = {
    name: file.name,
    size: formatFileSize(file.size),
    type: 'application/pdf',
    lastModified: new Date(file.lastModified)
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer, { 
      ignoreEncryption: true,
      updateMetadata: false 
    })

    const result = {
      fileInfo: basicInfo,
      document: {
        title: pdf.getTitle(),
        author: pdf.getAuthor(),
        subject: pdf.getSubject(),
        creator: pdf.getCreator(),
        producer: pdf.getProducer(),
        keywords: pdf.getKeywords(),
      },
      properties: {
        pageCount: pdf.getPageCount(),
        creationDate: pdf.getCreationDate(),
        modificationDate: pdf.getModificationDate(),
      }
    }

    // get page dimensions from first page
    const firstPage = pdf.getPage(0)
    if (firstPage) {
      const { width, height } = firstPage.getSize()
      result.properties.pageSize = `${Math.round(width)} x ${Math.round(height)} pts`
    }

    return result

  } catch (err) {
    console.error('PDF parsing failed:', err)
    return {
      fileInfo: basicInfo,
      error: 'Could not parse PDF: ' + err.message
    }
  }
}

async function extractImageMetadata(file) {
  const basicInfo = {
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type,
    lastModified: new Date(file.lastModified)
  }

  try {
    const exif = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
      ifd1: true,
      interop: true,
      iptc: true,
      xmp: true,
    })

    if (!exif) {
      return { fileInfo: basicInfo, note: 'No EXIF data found' }
    }

    const result = {
      fileInfo: basicInfo,
    }

    if (exif.Make || exif.Model) {
      result.camera = {
        make: exif.Make,
        model: exif.Model,
        software: exif.Software,
      }
    }

    if (exif.ExposureTime || exif.FNumber || exif.ISO) {
      result.settings = {
        exposureTime: exif.ExposureTime ? `1/${Math.round(1/exif.ExposureTime)}s` : null,
        fNumber: exif.FNumber ? `f/${exif.FNumber}` : null,
        iso: exif.ISO,
        focalLength: exif.FocalLength ? `${exif.FocalLength}mm` : null,
        flash: exif.Flash,
      }
    }

    if (exif.DateTimeOriginal || exif.CreateDate) {
      result.dates = {
        taken: exif.DateTimeOriginal,
        created: exif.CreateDate,
        modified: exif.ModifyDate,
      }
    }

    if (exif.latitude && exif.longitude) {
      result.gps = {
        latitude: exif.latitude,
        longitude: exif.longitude,
        altitude: exif.GPSAltitude,
      }
    }

    if (exif.ImageWidth || exif.ExifImageWidth) {
      result.dimensions = {
        width: exif.ImageWidth || exif.ExifImageWidth,
        height: exif.ImageHeight || exif.ExifImageHeight,
        orientation: exif.Orientation,
      }
    }

    return result

  } catch (err) {
    console.error('EXIF extraction failed:', err)
    return { 
      fileInfo: basicInfo, 
      error: 'Could not parse EXIF data' 
    }
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
