import { ArtisanCategory } from '@/types/artisan';

export const ARTISAN_CATEGORIES: ArtisanCategory[] = [
    'Electrician',
    'Plumber',
    'Mechanic (Auto)',
    'Generator Repair',
    'AC Technician',
    'Carpenter',
    'Painter',
    'Tiler',
    'Bricklayer',
    'Welder',
    'Roofer',
    'Cleaner',
    'Hairstylist',
    'Tailor',
];

export const CATEGORY_ICONS: Record<ArtisanCategory, string> = {
    'Electrician': '⚡',
    'Plumber': '🔧',
    'Mechanic (Auto)': '🔩',
    'Generator Repair': '🔌',
    'AC Technician': '❄️',
    'Carpenter': '🪚',
    'Painter': '🎨',
    'Tiler': '🧱',
    'Bricklayer': '🧱',
    'Welder': '🔥',
    'Roofer': '🏠',
    'Cleaner': '🧹',
    'Hairstylist': '✂️',
    'Tailor': '🧵',
};

export const CATEGORY_DESCRIPTIONS: Record<ArtisanCategory, string> = {
    'Electrician': 'Wiring, installations, repairs',
    'Plumber': 'Pipes, fixtures, drainage',
    'Mechanic (Auto)': 'Car repairs and maintenance',
    'Generator Repair': 'Generator servicing and fixes',
    'AC Technician': 'Air conditioning installation and repair',
    'Carpenter': 'Furniture, doors, woodwork',
    'Painter': 'Interior and exterior painting',
    'Tiler': 'Floor and wall tiling',
    'Bricklayer': 'Masonry and construction',
    'Welder': 'Metal fabrication and welding',
    'Roofer': 'Roofing installation and repair',
    'Cleaner': 'Home and office cleaning',
    'Hairstylist': 'Hair cutting and styling',
    'Tailor': 'Clothing alterations and sewing',
};
