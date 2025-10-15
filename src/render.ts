import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, type RGB } from "pdf-lib";
import type { ContainerNode, SectionNode, TextNode, VNode, BoxNode } from "./types";
import { writeFileSync } from "fs";

interface RenderContext {
  page: PDFPage;
  font: PDFFont;
  cursor: { x: number; y: number };
  bounds: { width: number; height: number; margin: number };
  pdf: PDFDocument;
}

class PDFRenderer {
  private context!: RenderContext;
  private readonly PAGE_WIDTH = 595;
  private readonly PAGE_HEIGHT = 842;
  private readonly DEFAULT_MARGIN = 50;

  constructor(private pdf: PDFDocument) {}

  async render(vnode: VNode, output: string): Promise<void> {
    const page = this.pdf.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    const font = await this.pdf.embedFont(StandardFonts.Helvetica);

    this.context = {
      page,
      font,
      cursor: { x: this.DEFAULT_MARGIN, y: this.PAGE_HEIGHT - this.DEFAULT_MARGIN },
      bounds: {
        width: this.PAGE_WIDTH,
        height: this.PAGE_HEIGHT,
        margin: this.DEFAULT_MARGIN,
      },
      pdf: this.pdf,
    };

    this.walk(vnode);

    const bytes = await this.pdf.save();
    writeFileSync(output, bytes);
    console.log("✅ PDF generated:", output);
  }

  private walk(node: VNode): void {
    if (Array.isArray(node)) {
      node.forEach((n) => this.walk(n));
      return;
    }
    if (!node) return;

    const handlers: Record<string, () => void> = {
      Doc: () => this.renderContainer(node as ContainerNode),
      Page: () => this.renderContainer(node as ContainerNode),
      Text: () => this.renderText(node as TextNode),
      Section: () => this.renderSection(node as SectionNode),
      Box: () => this.renderBox(node as BoxNode),
    };

    const handler = handlers[node.type];
    if (handler) handler();
  }

  private renderContainer(node: ContainerNode): void {
    if (node.children) {
      node.children.forEach((child) => this.walk(child));
    }
  }

  private renderText(node: TextNode): void {
    const size = node.size ?? 14;
    const colour = node.colour ?? "#000000";
    const align = node.align ?? "left";
    const margin = node.margin ?? [0, 0, 0, 0];

    const [top, right, bottom, left] = margin;

    // Apply top margin
    this.context.cursor.y -= top;

    // Check if we need a new page
    if (this.context.cursor.y < this.DEFAULT_MARGIN) {
      this.addNewPage();
    }

    // Calculate available width for text
    const availableWidth = this.context.bounds.width - 2 * this.DEFAULT_MARGIN - left - right;
    
    // Wrap text into lines
    const lines = this.wrapText(node.content, size, availableWidth);

    // Draw each line
    for (const line of lines) {
      // Check if we need a new page
      if (this.context.cursor.y < this.DEFAULT_MARGIN) {
        this.addNewPage();
      }

      const lineWidth = this.context.font.widthOfTextAtSize(line, size);
      let x = this.DEFAULT_MARGIN + left;

      if (align === "center") {
        x = (this.context.bounds.width - lineWidth) / 2;
      } else if (align === "right") {
        x = this.context.bounds.width - lineWidth - this.DEFAULT_MARGIN - right;
      }

      // Draw text
      this.context.page.drawText(line, {
        x,
        y: this.context.cursor.y,
        size,
        font: this.context.font,
        color: this.hexToRgb(colour),
      });

      // Move cursor down for next line
      this.context.cursor.y -= size + 4;
    }

    // Apply bottom margin
    this.context.cursor.y -= bottom;
  }

  private wrapText(text: string, fontSize: number, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = this.context.font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [''];
  }

  private renderSection(node: SectionNode): void {
    // Render section title
    this.renderText({
      type: "Text",
      content: node.title.toUpperCase(),
      size: 16,
      colour: "#000000",
      align: "left",
      margin: [0, 0, 0, 0],
    });

    // Render section children
    if (node.children) {
      node.children.forEach((child) => this.walk(child));
    }

    // Add spacing after section
    this.context.cursor.y -= 10;
  }

  private renderBox(node: BoxNode): void {
    const margin = node.margin ?? [0, 0, 0, 0];
    const padding = node.padding ?? [0, 0, 0, 0];
    const [marginTop, marginRight, marginBottom, marginLeft] = margin;
    const [paddingTop, paddingRight, paddingBottom, paddingLeft] = padding;

    // Apply top margin
    this.context.cursor.y -= marginTop;

    // Check if we need a new page
    if (this.context.cursor.y < this.DEFAULT_MARGIN) {
      this.addNewPage();
    }

    // Calculate box dimensions
    const boxX = this.DEFAULT_MARGIN + marginLeft;
    const boxWidth = node.width ?? (this.context.bounds.width - 2 * this.DEFAULT_MARGIN - marginLeft - marginRight);

    // Save starting position
    const boxStartY = this.context.cursor.y;
    const savedCursor = { ...this.context.cursor };

    // Adjust cursor for padding and render children
    this.context.cursor.x = boxX + paddingLeft;
    this.context.cursor.y -= paddingTop;

    const contentStartY = this.context.cursor.y;

    if (node.children) {
      node.children.forEach((child) => this.walk(child));
    }

    // Calculate actual content height
    const contentEndY = this.context.cursor.y;
    const contentHeight = contentStartY - contentEndY;
    const boxHeight = node.height ?? (contentHeight + paddingTop + paddingBottom);

    // Draw background if specified
    if (node.backgroundColor) {
      this.context.page.drawRectangle({
        x: boxX,
        y: boxStartY - boxHeight,
        width: boxWidth,
        height: boxHeight,
        color: this.hexToRgb(node.backgroundColor),
      });
    }

    // Draw border if specified
    if (node.border) {
      this.context.page.drawRectangle({
        x: boxX,
        y: boxStartY - boxHeight,
        width: boxWidth,
        height: boxHeight,
        borderColor: this.hexToRgb(node.border.color),
        borderWidth: node.border.width,
      });
    }

    // Restore cursor position and move past the box
    this.context.cursor.x = savedCursor.x;
    this.context.cursor.y = boxStartY - boxHeight - marginBottom;
  }

  private addNewPage(): void {
    const newPage = this.context.pdf.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    this.context.page = newPage;
    this.context.cursor.y = this.PAGE_HEIGHT - this.DEFAULT_MARGIN;
  }

  private hexToRgb(hex: string): RGB {
    // Remove # if present
    const clean = hex.startsWith("#") ? hex.slice(1) : hex;

    // Parse hex values
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;

    return rgb(r, g, b);
  }
}

export async function render(vnode: VNode, output: string): Promise<void> {
  const pdf = await PDFDocument.create();
  const renderer = new PDFRenderer(pdf);
  await renderer.render(vnode, output);
}