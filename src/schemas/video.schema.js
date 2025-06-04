import { z } from 'zod/v4';

// video validation schema
export const videoSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    professor: z.string().min(1, { message: 'Professor name is required' }),
    duration: z.string().regex(/^\d+:\d{2}$/, { message: 'Invalid duration format (mm:ss)' }),
    category: z.string().min(1, { message: 'Category is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
    thumbnail: z.string().url({ message: 'Invalid thumbnail URL' }),
    videoId: z.string().min(1, { message: 'Video ID is required' }),
});
