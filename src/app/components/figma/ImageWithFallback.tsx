import React, { useState, useEffect } from 'react'
import { getImageUrl } from '@/utils/r2Upload'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const { src, alt, style, className, ...rest } = props
  const finalSrc = typeof src === 'string' ? getImageUrl(src) : src

  useEffect(() => {
    // Reset state when src changes
    setDidError(false)
    setIsLoaded(false)
  }, [src])

  const handleError = () => {
    setDidError(true)
  }

  const handleLoad = () => {
    setIsLoaded(true)
  }

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={style}>
      {/* Skeleton/Placeholder */}
      {!isLoaded && !didError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {didError ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <img 
            src={ERROR_IMG_SRC} 
            alt="Error loading image" 
            {...rest} 
            data-original-url={src}
            className="w-12 h-12 opacity-30 object-contain"
          />
        </div>
      ) : (
        <img
          src={finalSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          {...rest}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}
