export const mimeTypesImages = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'] as const

export type MimeTypeImage = typeof mimeTypesImages[number]

export type ImageExt = MimeTypeImage extends `${infer _}/${infer ext}` ? ext : never

export const mimeTypesRevit = [
  'application/revit',
  'application/revit-family',
  'application/revit-template',
  'application/revit-family-template',
  'application/revit-group',
  'application/x-autodesk-revit',
  'application/x-autodesk-revit-family',
  'model/gltf-binary',
  'model/gltf+json',
  'application/x-3ds',
  'model/stl',
  // 'application/vnd.autodesk.revit.model',
  // 'application/vnd.autodesk.revit.project',
] as const

export type MimeTypeRevit = typeof mimeTypesRevit[number]

export type RevitExt = 'rvt'
