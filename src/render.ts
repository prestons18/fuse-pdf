import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, type RGB } from "pdf-lib";
import { writeFileSync } from "fs";

export interface TextNode {
  type: "Text";
  content: string;
  size?: number;
  colour?: string;
  align?: "left" | "center" | "right";
  margin?: [number, number, number, number];
}

export interface SectionNode {
  type: "Section";
  title: string;
  children: VNode[];
}

export interface ContainerNode {
  type: "Doc" | "Page";
  children: VNode[];
}

export type VNode = TextNode | SectionNode | ContainerNode | VNode[];

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

    // Calculate x position based on alignment
    const textWidth = this.context.font.widthOfTextAtSize(node.content, size);
    let x = this.DEFAULT_MARGIN + left;

    if (align === "center") {
      x = (this.context.bounds.width - textWidth) / 2;
    } else if (align === "right") {
      x = this.context.bounds.width - textWidth - this.DEFAULT_MARGIN - right;
    }

    // Draw text
    this.context.page.drawText(node.content, {
      x,
      y: this.context.cursor.y,
      size,
      font: this.context.font,
      color: this.hexToRgb(colour),
    });

    // Update cursor position
    this.context.cursor.y -= size + 4 + bottom;
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