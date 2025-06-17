import type { Attributor } from 'parchment';
declare module 'quill' {
    interface QuillStatic {
        import(path: string): Attributor;
    }
}