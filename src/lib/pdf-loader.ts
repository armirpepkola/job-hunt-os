import * as pdfjs from "pdfjs-dist";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PDFTextItem {
  str: string;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  if (typeof window === "undefined") return "";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const strings = content.items.map((item) => {
      const textItem = item as unknown as PDFTextItem;
      return textItem.str;
    });

    fullText += strings.join(" ") + "\n";
  }

  return fullText;
}
