// src/scripts/generate-quill-scss.ts
import 'dotenv/config';
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

interface GoogleFontItem {
    family: string;
    category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
}
interface GoogleFontsResponse {
    items: GoogleFontItem[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;
    if (!apiKey) {
        console.error('❌ Missing NEXT_PUBLIC_GOOGLE_FONTS_API_KEY in env');
        process.exit(1);
    }

    // 1. Fetch the font list with category
    const googleApiUrl = 'https://www.googleapis.com/webfonts/v1/webfonts';
    const { data } = await axios.get<GoogleFontsResponse>(googleApiUrl, {
        params: { key: apiKey, sort: 'alpha' },
    });
    const families = data.items; // { family, category }[]

    // 2. Build Sass map entries
    //    We slugify the font name for CSS class, and keep both label & category
    const fontMap = families
        .map(({ family, category }) => {
            const slug = family.replace(/\s+/g, '-');
            // Escape quotes around values
            return `  "${slug}": ("label": "${family}", "category": "${category}")`;
        })
        .join(',\n');

    const sizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
    const sizeMap = sizes.map((s) => `  ${s}: ${s}`).join(',\n');

    const scssContent = `// AUTO-GENERATED — do not edit
$quill-fonts: (
${fontMap}
);

$quill-sizes: (
${sizeMap}
);
`;

    // 3. Write to SCSS partial
    const outPath = path.resolve(__dirname, '..', 'assets/scss/base', '_quillvars.scss');
    await writeFile(outPath, scssContent, 'utf8');
    console.log('✅ _quillvars.scss generated at', outPath);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
