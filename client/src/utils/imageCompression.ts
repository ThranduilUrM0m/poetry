// src/utils/imageCompression.ts
export async function compressImage(file: File): Promise<File> {
    // mirror your Quill flow: max 10MB & max 1920px
    const maxSizeMB = 10;
    const maxWidthOrHeight = 1920;

    // use browser-image-compression under the hood
    const imageCompression = (await import('browser-image-compression')).default;
    if (file.size <= maxSizeMB * 1024 * 1024) return file;

    return imageCompression(file, {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: true,
    });
}
