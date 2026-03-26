import { IMAGE_BASE_URL } from '../config/api.js'

export const getImageUrl = (imagePath) => {
  // Fix placeholder path
  if (!imagePath) {
    return `${IMAGE_BASE_URL}/uploads/placeholder-image.jpg`
  }

  // If already full URL
  if (imagePath.startsWith('http')) {
    return imagePath
  }

  // If already contains /uploads
  if (imagePath.startsWith('/uploads')) {
    return `${IMAGE_BASE_URL}${imagePath}`
  }

  // Default case
  return `${IMAGE_BASE_URL}/uploads/${imagePath}`
}