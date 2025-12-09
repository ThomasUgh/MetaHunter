import exifr from 'exifr'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import * as mm from 'music-metadata'

const OFFICE_TYPES = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
}

const AUDIO_EXTENSIONS = ['mp3', 'flac', 'wav', 'ogg', 'm4a', 'aac', 'wma']
const VIDEO_EXTENSIONS = ['mp4', 'mkv', 'avi', 'mov', 'webm']

export async function extractMetadata(file) {
  const type = file.type
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (type.startsWith('image/')) {
    return extractImageMetadata(file)
  }

  if (type === 'application/pdf' || ext === 'pdf') {
    return extractPdfMetadata(file)
  }

  if (OFFICE_TYPES[type] || ['docx', 'xlsx', 'pptx'].includes(ext)) {
    return extractOfficeMetadata(file, ext || OFFICE_TYPES[type])
  }

  if (type.startsWith('audio/') || AUDIO_EXTENSIONS.includes(ext)) {
    return extractAudioMetadata(file)
  }

  if (type.startsWith('video/') || VIDEO_EXTENSIONS.includes(ext)) {
    return extractAudioMetadata(file)
  }

  return { 
    fileInfo: {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'unknown',
      lastModified: new Date(file.lastModified)
    },
    note: 'File type not fully supported yet'
  }
}

async function extractOfficeMetadata(file, ext) {
  const basicInfo = {
    name: file.name,
    size: formatFileSize(file.size),
    type: ext.toUpperCase(),
    lastModified: new Date(file.lastModified)
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)
    
    const coreXml = await zip.file('docProps/core.xml')?.async('text')
    const appXml = await zip.file('docProps/app.xml')?.async('text')

    const result = { fileInfo: basicInfo }

    if (coreXml) {
      result.document = {
        title: extractXmlTag(coreXml, 'dc:title'),
        creator: extractXmlTag(coreXml, 'dc:creator'),
        subject: extractXmlTag(coreXml, 'dc:subject'),
        description: extractXmlTag(coreXml, 'dc:description'),
        keywords: extractXmlTag(coreXml, 'cp:keywords'),
        lastModifiedBy: extractXmlTag(coreXml, 'cp:lastModifiedBy'),
        revision: extractXmlTag(coreXml, 'cp:revision'),
      }

      const created = extractXmlTag(coreXml, 'dcterms:created')
      const modified = extractXmlTag(coreXml, 'dcterms:modified')
      if (created || modified) {
        result.dates = {
          created: created ? new Date(created) : null,
          modified: modified ? new Date(modified) : null,
        }
      }
    }

    if (appXml) {
      result.application = {
        application: extractXmlTag(appXml, 'Application'),
        appVersion: extractXmlTag(appXml, 'AppVersion'),
        company: extractXmlTag(appXml, 'Company'),
        template: extractXmlTag(appXml, 'Template'),
      }

      const pages = extractXmlTag(appXml, 'Pages')
      const words = extractXmlTag(appXml, 'Words')
      const slides = extractXmlTag(appXml, 'Slides')

      if (pages || words || slides) {
        result.statistics = {
          pages: pages ? parseInt(pages) : null,
          words: words ? parseInt(words) : null,
          characters: extractXmlTag(appXml, 'Characters') ? parseInt(extractXmlTag(appXml, 'Characters')) : null,
          slides: slides ? parseInt(slides) : null,
        }
      }
    }

    return result

  } catch (err) {
    return { fileInfo: basicInfo, error: 'Could not parse Office document: ' + err.message }
  }
}

function extractXmlTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : null
}

async function extractAudioMetadata(file) {
  const basicInfo = {
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type || file.name.split('.').pop()?.toUpperCase(),
    lastModified: new Date(file.lastModified)
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8 = new Uint8Array(arrayBuffer)
    
    const metadata = await mm.parseBuffer(uint8, file.type, {
      duration: true,
      skipCovers: false,
    })

    const result = {
      fileInfo: basicInfo,
    }

    // format info
    if (metadata.format) {
      result.format = {
        container: metadata.format.container,
        codec: metadata.format.codec,
        duration: metadata.format.duration ? formatDuration(metadata.format.duration) : null,
        bitrate: metadata.format.bitrate ? Math.round(metadata.format.bitrate / 1000) + ' kbps' : null,
        sampleRate: metadata.format.sampleRate ? metadata.format.sampleRate + ' Hz' : null,
        channels: metadata.format.numberOfChannels,
        bitsPerSample: metadata.format.bitsPerSample,
      }
    }

    const tags = metadata.common
    if (tags) {
      result.tags = {
        title: tags.title,
        artist: tags.artist,
        album: tags.album,
        year: tags.year,
        track: tags.track?.no ? `${tags.track.no}/${tags.track.of || '?'}` : null,
        genre: tags.genre?.join(', '),
        composer: tags.composer?.join(', '),
        albumArtist: tags.albumartist,
        comment: tags.comment?.join(', '),
      }
    }

    if (metadata.common?.picture?.length > 0) {
      result.albumArt = {
        count: metadata.common.picture.length,
        formats: metadata.common.picture.map(p => p.format).join(', ')
      }
    }

    return result

  } catch (err) {
    console.error('Audio parsing failed:', err)
    return {
      fileInfo: basicInfo,
      error: 'Could not parse audio metadata: ' + err.message
    }
  }
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

async function extractPdfMetadata(file) {
  const basicInfo = {
    name: file.name,
    size: formatFileSize(file.size),
    type: 'PDF',
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
