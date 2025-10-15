import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, type RGB } from "pdf-lib";
import type { ContainerNode, SectionNode, TextNode, VNode, BoxNode } from "./types";
import { writeFileSync } from "fs";

interface RenderContext {
  page: PDFPage;
  fonts: FontCache;
  cursor: { x: number; y: number };
  bounds: { width: number; height: number; margin: number };
  pdf: PDFDocument;
}

interface FontCache {
  Helvetica: PDFFont;
  HelveticaBold: PDFFont;
  HelveticaOblique: PDFFont;
  HelveticaBoldOblique: PDFFont;
  Times: PDFFont;
  TimesBold: PDFFont;
  TimesItalic: PDFFont;
  TimesBoldItalic: PDFFont;
  Courier: PDFFont;
  CourierBold: PDFFont;
  CourierOblique: PDFFont;
  CourierBoldOblique: PDFFont;
}

class PDFRenderer {
  private context!: RenderContext;
  private readonly PAGE_WIDTH = 595;
  private readonly PAGE_HEIGHT = 842;
  private readonly DEFAULT_MARGIN = 50;

  constructor(private pdf: PDFDocument) {}

  async render(vnode: VNode, output: string): Promise<void> {
    const page = this.pdf.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    
    // Preload all fonts
    const fonts: FontCache = {
      Helvetica: await this.pdf.embedFont(StandardFonts.Helvetica),
      HelveticaBold: await this.pdf.embedFont(StandardFonts.HelveticaBold),
      HelveticaOblique: await this.pdf.embedFont(StandardFonts.HelveticaOblique),
      HelveticaBoldOblique: await this.pdf.embedFont(StandardFonts.HelveticaBoldOblique),
      Times: await this.pdf.embedFont(StandardFonts.TimesRoman),
      TimesBold: await this.pdf.embedFont(StandardFonts.TimesRomanBold),
      TimesItalic: await this.pdf.embedFont(StandardFonts.TimesRomanItalic),
      TimesBoldItalic: await this.pdf.embedFont(StandardFonts.TimesRomanBoldItalic),
      Courier: await this.pdf.embedFont(StandardFonts.Courier),
      CourierBold: await this.pdf.embedFont(StandardFonts.CourierBold),
      CourierOblique: await this.pdf.embedFont(StandardFonts.CourierOblique),
      CourierBoldOblique: await this.pdf.embedFont(StandardFonts.CourierBoldOblique),
    };

    this.context = {
      page,
      fonts,
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
    const fontFamily = node.font ?? "Helvetica";
    const weight = node.weight ?? "normal";
    const style = node.style ?? "normal";

    const [top, right, bottom, left] = margin;

    // Apply top margin
    this.context.cursor.y -= top;

    // Check if we need a new page
    if (this.context.cursor.y < this.DEFAULT_MARGIN) {
      this.addNewPage();
    }

    // Get the appropriate font
    const font = this.getFont(fontFamily, weight, style);

    // Calculate available width for text
    const availableWidth = this.context.bounds.width - 2 * this.DEFAULT_MARGIN - left - right;
    
    // Wrap text into lines
    const lines = this.wrapText(node.content, size, availableWidth, font);

    // Draw each line
    for (const line of lines) {
      // Check if we need a new page
      if (this.context.cursor.y < this.DEFAULT_MARGIN) {
        this.addNewPage();
      }

      const lineWidth = font.widthOfTextAtSize(line, size);
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
        font,
        color: this.hexToRgb(colour),
      });

      // Move cursor down for next line
      this.context.cursor.y -= size + 4;
    }

    // Apply bottom margin
    this.context.cursor.y -= bottom;
  }

  private wrapText(text: string, fontSize: number, maxWidth: number, font: PDFFont): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

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

  private getFont(family: string, weight: string, style: string): PDFFont {
    // Handle style="bold-italic" as a special case
    if (style === "bold-italic") {
      if (family === "Helvetica") return this.context.fonts.HelveticaBoldOblique;
      if (family === "Times") return this.context.fonts.TimesBoldItalic;
      if (family === "Courier") return this.context.fonts.CourierBoldOblique;
    }
    
    // Handle weight and style combinations
    const isBold = weight === "bold" || style === "bold-italic";
    const isItalic = style === "italic" || style === "bold-italic";
    
    if (family === "Helvetica") {
      if (isBold && isItalic) return this.context.fonts.HelveticaBoldOblique;
      if (isBold) return this.context.fonts.HelveticaBold;
      if (isItalic) return this.context.fonts.HelveticaOblique;
      return this.context.fonts.Helvetica;
    }
    
    if (family === "Times") {
      if (isBold && isItalic) return this.context.fonts.TimesBoldItalic;
      if (isBold) return this.context.fonts.TimesBold;
      if (isItalic) return this.context.fonts.TimesItalic;
      return this.context.fonts.Times;
    }
    
    if (family === "Courier") {
      if (isBold && isItalic) return this.context.fonts.CourierBoldOblique;
      if (isBold) return this.context.fonts.CourierBold;
      if (isItalic) return this.context.fonts.CourierOblique;
      return this.context.fonts.Courier;
    }
    
    return this.context.fonts.Helvetica;
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