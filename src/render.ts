import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync } from "fs";

export async function render(vnode: any, output: string) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  let y = 800;

  const drawText = (text: string, size = 14) => {
    page.drawText(text, { x: 50, y, size, font, color: rgb(0, 0, 0) });
    y -= size + 4;
  };

  const walk = (node: any) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node) return;

    switch (node.type) {
      case "Doc":
      case "Page":
        node.children.forEach(walk);
        break;

      case "Text":
        drawText(node.content, node.size);
        break;

      case "Section":
        drawText(node.title.toUpperCase(), 16);
        node.children.forEach(walk);
        y -= 10;
        break;
    }
  };

  walk(vnode);

  const bytes = await pdf.save();
  writeFileSync(output, bytes);
  console.log("✅ PDF generated:", output);
}