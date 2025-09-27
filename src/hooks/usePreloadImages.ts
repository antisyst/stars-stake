import { useState, useEffect } from 'react'

export const usePreloadImages = (imageUrls: string[]): boolean => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (imageUrls.length === 0) {
      setLoaded(true)
      return
    }

    let count = 0
    const onLoad = () => {
      count += 1
      if (count >= imageUrls.length) {
        setLoaded(true)
      }
    }

    imageUrls.forEach((url) => {
      const img = new Image()
      img.src = url
      img.onload = onLoad
      img.onerror = onLoad
    })
  }, [imageUrls])

  return loaded
}