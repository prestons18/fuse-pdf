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

type FontCache = Record<string, PDFFont>;

class PDFRenderer {
  private context!: RenderContext;
  private readonly PAGE_WIDTH = 595;
  private readonly PAGE_HEIGHT = 842;
  private readonly DEFAULT_MARGIN = 50;

  constructor(private pdf: PDFDocument) {}

  async render(vnode: VNode, output: string): Promise<void> {
    const page = this.pdf.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    
    // Preload all fonts
    const fontMap = [
      ['Helvetica', StandardFonts.Helvetica],
      ['HelveticaBold', StandardFonts.HelveticaBold],
      ['HelveticaOblique', StandardFonts.HelveticaOblique],
      ['HelveticaBoldOblique', StandardFonts.HelveticaBoldOblique],
      ['Times', StandardFonts.TimesRoman],
      ['TimesBold', StandardFonts.TimesRomanBold],
      ['TimesItalic', StandardFonts.TimesRomanItalic],
      ['TimesBoldItalic', StandardFonts.TimesRomanBoldItalic],
      ['Courier', StandardFonts.Courier],
      ['CourierBold', StandardFonts.CourierBold],
      ['CourierOblique', StandardFonts.CourierOblique],
      ['CourierBoldOblique', StandardFonts.CourierBoldOblique],
    ] as const;
    
    const fonts: FontCache = Object.fromEntries(
      await Promise.all(fontMap.map(async ([key, font]) => [key, await this.pdf.embedFont(font)]))
    );

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
    if (Array.isArray(node)) return node.forEach((n) => this.walk(n));
    if (!node) return;

    const handlers: Record<string, (n: any) => void> = {
      Doc: (n) => n.children?.forEach((c: VNode) => this.walk(c)),
      Page: (n) => n.children?.forEach((c: VNode) => this.walk(c)),
      Text: (n) => this.renderText(n),
      Section: (n) => this.renderSection(n),
      Box: (n) => this.renderBox(n),
    };

    handlers[node.type]?.(node);
  }

  private renderText(node: TextNode): void {
    const size = node.size ?? 14;
    const colour = node.colour ?? "#000000";
    const align = node.align ?? "left";
    const margin = node.margin ?? [0, 0, 0, 0];
    const lineHeight = node.lineHeight ?? size * 1.2;
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
      this.context.cursor.y -= lineHeight;
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
    const isBold = weight === "bold" || style === "bold-italic";
    const isItalic = style === "italic" || style === "bold-italic";
    
    const fontMap: Record<string, [string, string, string, string]> = {
      Helvetica: ['Helvetica', 'HelveticaBold', 'HelveticaOblique', 'HelveticaBoldOblique'],
      Times: ['Times', 'TimesBold', 'TimesItalic', 'TimesBoldItalic'],
      Courier: ['Courier', 'CourierBold', 'CourierOblique', 'CourierBoldOblique'],
    };
    
    const fonts = fontMap[family] || fontMap.Helvetica;
    const idx = (isBold ? 1 : 0) + (isItalic ? 2 : 0);
    return this.context.fonts[fonts[idx]];
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
    const position = node.position ?? "relative";

    // Determine box position based on positioning mode
    let boxX: number;
    let boxStartY: number;
    const savedCursor = { ...this.context.cursor };

    if (position === "absolute" && node.x !== undefined && node.y !== undefined) {
      // Absolute positioning: x,y from bottom-left of page
      boxX = node.x;
      boxStartY = node.y;
    } else if (position === "relative" && (node.x !== undefined || node.y !== undefined)) {
      // Relative positioning: offset from current cursor position
      const offsetX = node.x ?? 0;
      const offsetY = node.y ?? 0;
      boxX = this.context.cursor.x + offsetX + marginLeft;
      boxStartY = this.context.cursor.y - marginTop + offsetY;
    } else {
      // Flow-based positioning (default behavior)
      this.context.cursor.y -= marginTop;
      
      if (this.context.cursor.y < this.DEFAULT_MARGIN) {
        this.addNewPage();
      }
      
      boxX = this.DEFAULT_MARGIN + marginLeft;
      boxStartY = this.context.cursor.y;
    }

    // Calculate box dimensions
    const boxWidth = node.width ?? (this.context.bounds.width - 2 * this.DEFAULT_MARGIN - marginLeft - marginRight);

    // If we need to draw background/border, we need to know the height first
    // Do a dry run to calculate content height if height is not specified
    let boxHeight: number;
    
    if (!node.height && (node.backgroundColor || node.border)) {
      // Dry run: calculate content height without actually drawing
      const tempCursor = { ...this.context.cursor };
      this.context.cursor.x = boxX + paddingLeft;
      this.context.cursor.y = boxStartY - paddingTop;
      
      const contentStartY = this.context.cursor.y;
      
      if (node.children) {
        node.children.forEach((child) => this.walk(child));
      }
      
      const contentEndY = this.context.cursor.y;
      const contentHeight = contentStartY - contentEndY;
      boxHeight = contentHeight + paddingTop + paddingBottom;
      
      // Restore cursor for actual rendering
      this.context.cursor = tempCursor;
    } else {
      boxHeight = node.height ?? 0;
    }

    // Draw background FIRST (underneath content)
    if (node.backgroundColor) {
      this.context.page.drawRectangle({
        x: boxX,
        y: boxStartY - boxHeight,
        width: boxWidth,
        height: boxHeight,
        color: this.hexToRgb(node.backgroundColor),
      });
    }

    // Draw border
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

    // Now render children on top of background (only once)
    this.context.cursor.x = boxX + paddingLeft;
    this.context.cursor.y = boxStartY - paddingTop;

    if (node.children) {
      node.children.forEach((child) => this.walk(child));
    }

    // Recalculate height if it wasn't pre-calculated
    if (!node.height && !node.backgroundColor && !node.border) {
      const contentEndY = this.context.cursor.y;
      const contentStartY = boxStartY - paddingTop;
      const contentHeight = contentStartY - contentEndY;
      boxHeight = contentHeight + paddingTop + paddingBottom;
    }

    // Restore cursor position based on positioning mode
    if (position === "absolute") {
      // Absolute positioning doesn't affect document flow
      this.context.cursor = savedCursor;
    } else {
      // Relative and flow positioning advance the cursor
      this.context.cursor.x = savedCursor.x;
      this.context.cursor.y = boxStartY - boxHeight - marginBottom;
    }
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