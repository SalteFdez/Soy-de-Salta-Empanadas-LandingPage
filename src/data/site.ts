// Single source of truth for contact info and the menu.

export const WHATSAPP_URL = "https://wa.link/8su45f";
export const PHONE_DISPLAY = "387 534 9832";
export const PHONE_TEL = "+5493875349832";
export const ADDRESS = "Av. Reyes Católicos 1454, Salta";
export const INSTAGRAM_HANDLE = "@soydesalta_empanadas";
export const INSTAGRAM_URL = "https://www.instagram.com/soydesalta_empanadas/";

export const IMAGES = {
  hero: "/images/625054175_18311093194249344_4971807672327989182_n.jpg",
  boxes: "/images/620512222_18092587207781818_7371581593237611006_n.jpg",
  empanadas: "/images/623414614_18092601208964507_902926476756083827_n.jpg",
  locro: "/images/632872383_18413678359192436_7163710540989274713_n.jpg",
  logo: "/images/122102219_2476402172657228_1743387213831886906_n.jpg",
} as const;

export type MenuItem = {
  name: string;
  note: string;
  /** box colour from the delivery-box tower */
  box: "copper" | "yolk" | "magenta" | "kraft";
  star?: boolean;
};

export const MENU: MenuItem[] = [
  { name: "Empanadas salteñas", note: "La estrella de la casa, por docena.", box: "copper", star: true },
  { name: "Locro", note: "Espeso, calentito y bien norteño.", box: "yolk" },
  { name: "Humita en chala", note: "Choclo cremoso envuelto en su chala.", box: "magenta" },
  { name: "Tamales", note: "El clásico del norte, como en casa.", box: "kraft" },
];
