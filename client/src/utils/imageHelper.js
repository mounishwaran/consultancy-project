import { IMAGE_BASE_URL } from '../config/api.js'

export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image'
  
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  if (imagePath.startsWith('/uploads')) {
    return `${IMAGE_BASE_URL}${imagePath}`
  }
  
  return `${IMAGE_BASE_URL}/uploads/${imagePath}`
}