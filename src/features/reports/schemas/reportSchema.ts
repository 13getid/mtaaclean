import { z } from 'zod'

export const reportSchema = z.object({
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters long to provide sufficient detail for cleanup teams')
    .max(2000, 'Description must not exceed 2000 characters'),
  address_hint: z
    .string()
    .max(255, 'Landmark description must be under 255 characters')
    .optional(),
  latitude: z
    .number({ required_error: 'Latitude is required. Please pick a location.' })
    .min(-4.060, 'Location must be within Tudor, Mombasa (latitude too far south)')
    .max(-4.015, 'Location must be within Tudor, Mombasa (latitude too far north)'),
  longitude: z
    .number({ required_error: 'Longitude is required. Please pick a location.' })
    .min(39.645, 'Location must be within Tudor, Mombasa (longitude too far west)')
    .max(39.690, 'Location must be within Tudor, Mombasa (longitude too far east)'),
  photo: z
    .instanceof(File, { message: 'A photograph is required as evidence' })
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Photograph size must be 10MB or less')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Only JPG, PNG, and WebP image formats are supported',
    ),
})

export type ReportFormData = z.infer<typeof reportSchema>
