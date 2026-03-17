import { IMAGE_BASE_URL } from '../config/api.js'

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg'
  
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  if (imagePath.startsWith('/uploads')) {
    return `${IMAGE_BASE_URL}${imagePath}`
  }
  
  return `${IMAGE_BASE_URL}/uploads/${imagePath}`
}
