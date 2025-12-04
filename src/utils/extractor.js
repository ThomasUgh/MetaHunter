import exifr from 'exifr'

export async function extractMetadata(file) {
  const type = file.type

  // for now only images
  if (type.startsWith('image/')) {
    return extractImageMetadata(file)
  }

  // TODO: add more file types
  return { 
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    },
    note: 'File type not fully supported yet'
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
    // extract all available exif data
    const exif = await exifr.parse(file, {
      // get everything we can
      tiff: true,
      exif: true,
      gps: true,
      ifd1: true, // thumbnail info
      interop: true,
      iptc: true,
      xmp: true,
    })

    if (!exif) {
      return { fileInfo: basicInfo, note: 'No EXIF data found' }
    }

    // organize the data a bit
    const result = {
      fileInfo: basicInfo,
    }

    // camera info
    if (exif.Make || exif.Model) {
      result.camera = {
        make: exif.Make,
        model: exif.Model,
        software: exif.Software,
      }
    }

    // image settings
    if (exif.ExposureTime || exif.FNumber || exif.ISO) {
      result.settings = {
        exposureTime: exif.ExposureTime ? `1/${Math.round(1/exif.ExposureTime)}s` : null,
        fNumber: exif.FNumber ? `f/${exif.FNumber}` : null,
        iso: exif.ISO,
        focalLength: exif.FocalLength ? `${exif.FocalLength}mm` : null,
        flash: exif.Flash,
      }
    }

    // dates
    if (exif.DateTimeOriginal || exif.CreateDate) {
      result.dates = {
        taken: exif.DateTimeOriginal,
        created: exif.CreateDate,
        modified: exif.ModifyDate,
      }
    }

    // gps
    if (exif.latitude && exif.longitude) {
      result.gps = {
        latitude: exif.latitude,
        longitude: exif.longitude,
        altitude: exif.GPSAltitude,
      }
    }

    // image dimensions
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
