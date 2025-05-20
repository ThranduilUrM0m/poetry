export function extractHTMLContent(htmlContent: string): string {
    if (!htmlContent) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.innerHTML;
}