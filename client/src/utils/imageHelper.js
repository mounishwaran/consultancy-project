export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg'
  
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  if (imagePath.startsWith('/uploads')) {
    return `http://localhost:5000${imagePath}`
  }
  
  return `http://localhost:5000/uploads/${imagePath}`
}

