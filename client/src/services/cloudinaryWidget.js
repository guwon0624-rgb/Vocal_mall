const WIDGET_SCRIPT_ID = 'cloudinary-upload-widget'
const WIDGET_SCRIPT_URL =
  'https://upload-widget.cloudinary.com/global/all.js'

let widgetScriptPromise

const loadCloudinaryWidget = () => {
  if (window.cloudinary?.createUploadWidget) {
    return Promise.resolve()
  }

  if (widgetScriptPromise) {
    return widgetScriptPromise
  }

  widgetScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(WIDGET_SCRIPT_ID)

    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Cloudinary 위젯을 불러오지 못했습니다.')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.id = WIDGET_SCRIPT_ID
    script.src = WIDGET_SCRIPT_URL
    script.async = true
    script.addEventListener('load', resolve, { once: true })
    script.addEventListener(
      'error',
      () => reject(new Error('Cloudinary 위젯을 불러오지 못했습니다.')),
      { once: true },
    )
    document.head.appendChild(script)
  })

  return widgetScriptPromise
}

export const createCloudinaryUploadWidget = async (callback) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary cloud name과 unsigned upload preset을 설정해 주세요.',
    )
  }

  await loadCloudinaryWidget()

  return window.cloudinary.createUploadWidget(
    {
      cloudName,
      uploadPreset,
      sources: ['local', 'camera', 'url'],
      multiple: false,
      cropping: true,
      croppingAspectRatio: 1.34,
      showSkipCropButton: true,
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      maxImageFileSize: 5 * 1024 * 1024,
      resourceType: 'image',
      styles: {
        palette: {
          window: '#F4F1EA',
          windowBorder: '#172033',
          tabIcon: '#9A7131',
          menuIcons: '#172033',
          textDark: '#172033',
          textLight: '#F7F1E7',
          link: '#9A7131',
          action: '#C8953D',
          inactiveTabIcon: '#7A848A',
          error: '#B34F49',
          inProgress: '#C8953D',
          complete: '#4F7258',
          sourceBg: '#E8ECE9',
        },
      },
    },
    callback,
  )
}
