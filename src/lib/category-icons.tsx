import {
  Camera,
  Aperture,
  Lightbulb,
  Mic,
  Plane,
  Speaker,
  Car,
  Gamepad2,
  Bike,
  Laptop,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps a category `icon` key (from the backend / mock data) to a Lucide icon.
 * Keys are stable Latin slugs; labels are translated in the data layer.
 */
export const categoryIconMap: Record<string, LucideIcon> = {
  // Target marketplace categories
  cars: Car,
  car: Car,
  consoles: Gamepad2,
  console: Gamepad2,
  bikes: Bike,
  bike: Bike,
  cameras: Camera,
  camera: Camera,
  laptops: Laptop,
  laptop: Laptop,

  // Legacy photo-gear keys (kept for backward compatibility)
  aperture: Aperture,
  lightbulb: Lightbulb,
  mic: Mic,
  plane: Plane,
  speaker: Speaker,
};
