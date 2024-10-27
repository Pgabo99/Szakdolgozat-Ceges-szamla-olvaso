declare module 'pdfjs-dist/legacy/build/pdf' {
    export const GlobalWorkerOptions: any;
    export function getDocument(src: any): any;
  }
  
  declare module 'pdfjs-dist/legacy/build/pdf.worker.entry' {
    const worker: any;
    export default worker;
  }