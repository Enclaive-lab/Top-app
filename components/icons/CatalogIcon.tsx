import {
  BookOpen, Camera, ChartNoAxesCombined, Clapperboard, CodeXml,
  GraduationCap, Image, LampDesk, LayoutDashboard, Megaphone,
  NotebookPen, Palette, PanelsTopLeft, PenTool, Tablet, Type,
  type LucideIcon,
} from "lucide-react";
import type { CatalogItem } from "@/data/catalog";

// Каждый значок описывает содержание карточки, а не инициалы школы.
const itemIcons: Record<string, LucideIcon> = {
  "designer-pro": Image,
  "photoshop-start": Image,
  "retouch-lab": Camera,
  "graphic-designer": PenTool,
  "design-faculty": Palette,
  "figma-interface": PanelsTopLeft,
  "motion-start": Clapperboard,
  "vector-illustration": PenTool,
  "frontend-start": CodeXml,
  "nextjs-practice": CodeXml,
  "data-analyst": ChartNoAxesCombined,
  "marketing-practice": Megaphone,
  "design-board": LayoutDashboard,
  "palette-studio": Palette,
  "type-library": Type,
  "design-basics-book": BookOpen,
  "interface-book": BookOpen,
  "javascript-book": BookOpen,
  "tablet-mini": Tablet,
  "desk-light": LampDesk,
  "notebook-grid": NotebookPen,
};

const categoryIcons: Record<string, LucideIcon> = {
  photoshop: Image, "graphic-design": PenTool, figma: PanelsTopLeft,
  "after-effects": Clapperboard, illustrator: PenTool, frontend: CodeXml,
  analytics: ChartNoAxesCombined, marketing: Megaphone,
  typescript: CodeXml, nextjs: CodeXml, golang: CodeXml,
};

const kindIcons = { course: GraduationCap, service: LayoutDashboard, book: BookOpen, product: Tablet };

export function CatalogIcon({ product }: { product: Pick<CatalogItem, "slug" | "category" | "kind"> }) {
  const Icon = itemIcons[product.slug] ?? categoryIcons[product.category] ?? kindIcons[product.kind];
  return <Icon size={34} strokeWidth={1.8} absoluteStrokeWidth aria-hidden="true" />;
}
