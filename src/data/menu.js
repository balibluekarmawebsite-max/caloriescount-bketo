// BKETO menu data — items, chef builds, goals, slots.
// Macros are per listed menu portion. net = carbs - fibre.
// Calorie model: 4 kcal/g protein, 4 kcal/g net carb, 9 kcal/g fat, 2 kcal/g fibre.

export const CATEGORIES = {
  base: "Base",
  protein: "Protein",
  side: "Side",
  sauce: "Sauce",
  dressing: "Dressing",
  topping: "Topping",
};

// BKETO restaurant contact (reservations go here).
export const BKETO = {
  name: "BKETO Bali",
  // WhatsApp number in international digits only (for wa.me).
  whatsapp: "6281802152888", // +62 818-0215-2888
  whatsappDisplay: "+62 818-0215-2888",
};

export const ITEMS = [
  {"id": "i0", "cat": "base", "name": "Brioche Toast", "por": "2 slices", "price": 25, "p": 7, "f": 8, "c": 38, "fib": 2, "net": 36, "kcal": 248, "tags": ["VG"], "keto": "no"},
  {"id": "i1", "cat": "base", "name": "Sourdough Toast", "por": "2 slices", "price": 25, "p": 10, "f": 2, "c": 50, "fib": 3, "net": 47, "kcal": 252, "tags": ["VG"], "keto": "no"},
  {"id": "i2", "cat": "base", "name": "Roasted Sweet Potato", "por": "150 g", "price": 30, "p": 3, "f": 5, "c": 31, "fib": 5, "net": 26, "kcal": 171, "tags": ["GF"], "keto": "no"},
  {"id": "i3", "cat": "base", "name": "Steamed Sweet Potato", "por": "150 g", "price": 30, "p": 2, "f": 0, "c": 27, "fib": 4, "net": 23, "kcal": 108, "tags": ["VG", "GF"], "keto": "no"},
  {"id": "i4", "cat": "base", "name": "Cabbage Hashbrowns", "por": "3 pcs · 150 g", "price": 30, "p": 5, "f": 15, "c": 11, "fib": 4, "net": 7, "kcal": 191, "tags": ["VG", "GF"], "keto": "some"},
  {"id": "i5", "cat": "base", "name": "Cauliflower Waffle", "por": "150 g", "price": 35, "p": 12, "f": 15, "c": 9, "fib": 3, "net": 6, "kcal": 213, "tags": ["GF"], "keto": "some"},
  {"id": "i6", "cat": "base", "name": "Cauliflower Rice", "por": "150 g", "price": 35, "p": 3, "f": 5, "c": 8, "fib": 3, "net": 5, "kcal": 83, "tags": ["GF"], "keto": "yes"},
  {"id": "i7", "cat": "base", "name": "Corn Tortilla Chips", "por": "90 g", "price": 35, "p": 6, "f": 21, "c": 57, "fib": 5, "net": 52, "kcal": 431, "tags": ["VG", "GF"], "keto": "no"},
  {"id": "i8", "cat": "base", "name": "Red Quinoa", "por": "120 g", "price": 40, "p": 5, "f": 2, "c": 26, "fib": 3, "net": 23, "kcal": 136, "tags": ["VG", "GF"], "keto": "no"},
  {"id": "i9", "cat": "base", "name": "Almond Bread", "por": "2 slices · 100 g", "price": 45, "p": 12, "f": 25, "c": 8, "fib": 4, "net": 4, "kcal": 297, "tags": ["GF"], "keto": "yes"},
  {"id": "i10", "cat": "base", "name": "Shirataki Noodle", "por": "100 g", "price": 55, "p": 0, "f": 0, "c": 3, "fib": 3, "net": 0, "kcal": 6, "tags": ["VG", "GF"], "keto": "yes"},
  {"id": "i11", "cat": "protein", "name": "Egg any Style", "por": "2 pcs", "price": 30, "p": 12, "f": 14, "c": 1, "fib": 0, "net": 1, "kcal": 178, "tags": ["GF"], "keto": "yes"},
  {"id": "i12", "cat": "protein", "name": "Fried Tofu", "por": "100 g", "price": 35, "p": 17, "f": 20, "c": 10, "fib": 4, "net": 6, "kcal": 280, "tags": ["GF"], "keto": "some"},
  {"id": "i13", "cat": "protein", "name": "Bacon", "por": "3 slices", "price": 45, "p": 9, "f": 10, "c": 0, "fib": 0, "net": 0, "kcal": 126, "tags": ["GF"], "keto": "yes"},
  {"id": "i14", "cat": "protein", "name": "Vegan Falafel", "por": "3 pcs · 100 g", "price": 45, "p": 13, "f": 18, "c": 32, "fib": 5, "net": 27, "kcal": 332, "tags": ["VG", "GF"], "keto": "no"},
  {"id": "i15", "cat": "protein", "name": "Grilled Chicken Breast", "por": "150 g", "price": 55, "p": 46, "f": 6, "c": 0, "fib": 0, "net": 0, "kcal": 238, "tags": ["GF"], "keto": "yes"},
  {"id": "i16", "cat": "protein", "name": "Pan Seared Barramundi", "por": "150 g", "price": 75, "p": 34, "f": 9, "c": 0, "fib": 0, "net": 0, "kcal": 217, "tags": ["GF"], "keto": "yes"},
  {"id": "i17", "cat": "protein", "name": "Grilled Sesame-crusted Tuna", "por": "150 g", "price": 75, "p": 46, "f": 11, "c": 2, "fib": 1, "net": 1, "kcal": 289, "tags": ["GF"], "keto": "yes"},
  {"id": "i18", "cat": "protein", "name": "Pan Seared Snapper", "por": "150 g", "price": 75, "p": 39, "f": 8, "c": 0, "fib": 0, "net": 0, "kcal": 228, "tags": ["GF"], "keto": "yes"},
  {"id": "i19", "cat": "protein", "name": "Beef Tenderloin", "por": "200 g", "price": 175, "p": 56, "f": 25, "c": 0, "fib": 0, "net": 0, "kcal": 449, "tags": ["GF"], "keto": "yes"},
  {"id": "i20", "cat": "protein", "name": "Pan Seared Salmon", "por": "150 g", "price": 165, "p": 33, "f": 21, "c": 0, "fib": 0, "net": 0, "kcal": 321, "tags": ["GF"], "keto": "yes"},
  {"id": "i21", "cat": "dressing", "name": "Citrus Dressing", "por": "30 ml", "price": 20, "p": 0, "f": 13, "c": 3, "fib": 0, "net": 3, "kcal": 129, "tags": ["GF"], "keto": "yes"},
  {"id": "i22", "cat": "dressing", "name": "Balsamic Dressing", "por": "30 ml", "price": 20, "p": 0, "f": 9, "c": 5, "fib": 0, "net": 5, "kcal": 101, "tags": ["GF"], "keto": "no"},
  {"id": "i23", "cat": "dressing", "name": "VCO Dressing", "por": "30 ml", "price": 20, "p": 0, "f": 16, "c": 1, "fib": 0, "net": 1, "kcal": 148, "tags": ["GF"], "keto": "yes"},
  {"id": "i24", "cat": "dressing", "name": "Honey Mustard Dressing", "por": "30 ml", "price": 20, "p": 0, "f": 11, "c": 9, "fib": 0, "net": 9, "kcal": 135, "tags": ["GF"], "keto": "no"},
  {"id": "i25", "cat": "dressing", "name": "Ponzu Dressing", "por": "30 ml", "price": 20, "p": 1, "f": 5, "c": 3, "fib": 0, "net": 3, "kcal": 61, "tags": ["GF"], "keto": "yes"},
  {"id": "i26", "cat": "side", "name": "Grilled Tomato", "por": "80 g", "price": 20, "p": 1, "f": 3, "c": 3, "fib": 1, "net": 2, "kcal": 41, "tags": ["VG", "GF"], "keto": "yes"},
  {"id": "i27", "cat": "side", "name": "Fresh Cherry Tomatoes", "por": "80 g", "price": 20, "p": 1, "f": 0, "c": 3, "fib": 1, "net": 2, "kcal": 14, "tags": ["VG", "GF"], "keto": "yes"},
  {"id": "i28", "cat": "side", "name": "Pinto Beans", "por": "100 g", "price": 25, "p": 9, "f": 1, "c": 26, "fib": 9, "net": 17, "kcal": 131, "tags": ["VG", "GF"], "keto": "no"},
  {"id": "i29", "cat": "side", "name": "Pickled Beetroot", "por": "80 g", "price": 25, "p": 1, "f": 0, "c": 13, "fib": 1, "net": 12, "kcal": 54, "tags": ["VG", "GF"], "keto": "no"},
  {"id": "i30", "cat": "side", "name": "Sautéed Mushrooms", "por": "100 g", "price": 30, "p": 3, "f": 5, "c": 4, "fib": 1, "net": 3, "kcal": 71, "tags": ["VG", "GF"], "keto": "yes"},
  {"id": "i31", "cat": "side", "name": "Sautéed Spinach & Garlic", "por": "100 g", "price": 30, "p": 3, "f": 5, "c": 4, "fib": 2, "net": 2, "kcal": 69, "tags": ["VG", "GF"], "keto": "yes"},
  {"id": "i32", "cat": "side", "name": "Shredded Red & White Cabbage", "por": "100 g", "price": 30, "p": 1, "f": 0, "c": 6, "fib": 2, "net": 4, "kcal": 24, "tags": ["VG", "GF"], "keto": "yes"},
  {"id": "i33", "cat": "side", "name": "Sliced Avocado", "por": "75 g", "price": 35, "p": 2, "f": 11, "c": 6, "fib": 5, "net": 1, "kcal": 121, "tags": ["VG", "GF"], "keto": "yes"},
  {"id": "i34", "cat": "side", "name": "Mashed Avocado", "por": "75 g", "price": 35, "p": 2, "f": 11, "c": 7, "fib": 5, "net": 2, "kcal": 125, "tags": ["VG", "GF"], "keto": "yes"},
  {"id": "i35", "cat": "side", "name": "Mixed Green Salad", "por": "100 g", "price": 35, "p": 2, "f": 0, "c": 4, "fib": 2, "net": 2, "kcal": 20, "tags": ["VG", "GF"], "keto": "yes"},
  {"id": "i36", "cat": "side", "name": "Sautéed Vegetables", "por": "120 g", "price": 35, "p": 2, "f": 5, "c": 8, "fib": 3, "net": 5, "kcal": 79, "tags": ["VG", "GF"], "keto": "yes"},
  {"id": "i37", "cat": "side", "name": "Cucumber Tzatziki", "por": "100 g", "price": 35, "p": 4, "f": 7, "c": 5, "fib": 1, "net": 4, "kcal": 97, "tags": ["GF"], "keto": "yes"},
  {"id": "i38", "cat": "side", "name": "Roasted Chickpeas", "por": "80 g", "price": 40, "p": 7, "f": 7, "c": 22, "fib": 6, "net": 16, "kcal": 167, "tags": ["VG", "GF"], "keto": "no"},
  {"id": "i39", "cat": "side", "name": "Vegetable Shakshuka", "por": "150 g", "price": 40, "p": 3, "f": 6, "c": 11, "fib": 3, "net": 8, "kcal": 104, "tags": ["VG", "GF"], "keto": "some"},
  {"id": "i40", "cat": "side", "name": "Cheese-Stuffed Zucchini", "por": "100 g", "price": 40, "p": 7, "f": 9, "c": 4, "fib": 1, "net": 3, "kcal": 123, "tags": ["GF"], "keto": "yes"},
  {"id": "i41", "cat": "sauce", "name": "Creamy Mushroom", "por": "50 g", "price": 20, "p": 1, "f": 8, "c": 3, "fib": 0, "net": 3, "kcal": 88, "tags": ["GF"], "keto": "yes"},
  {"id": "i42", "cat": "sauce", "name": "Sage Butter", "por": "15 g", "price": 20, "p": 0, "f": 12, "c": 0, "fib": 0, "net": 0, "kcal": 108, "tags": ["GF"], "keto": "yes"},
  {"id": "i43", "cat": "sauce", "name": "Pesto", "por": "30 g", "price": 25, "p": 3, "f": 15, "c": 2, "fib": 1, "net": 1, "kcal": 153, "tags": ["GF"], "keto": "yes"},
  {"id": "i44", "cat": "sauce", "name": "Hollandaise", "por": "40 g", "price": 25, "p": 2, "f": 20, "c": 1, "fib": 0, "net": 1, "kcal": 192, "tags": ["GF"], "keto": "yes"},
  {"id": "i45", "cat": "sauce", "name": "Beurre Blanc Dill", "por": "30 g", "price": 25, "p": 0, "f": 16, "c": 1, "fib": 0, "net": 1, "kcal": 148, "tags": ["GF"], "keto": "yes"},
  {"id": "i46", "cat": "sauce", "name": "Harissa", "por": "20 g", "price": 25, "p": 1, "f": 3, "c": 3, "fib": 1, "net": 2, "kcal": 41, "tags": ["VG", "GF"], "keto": "yes"},
  {"id": "i47", "cat": "sauce", "name": "Truffle Sauce", "por": "30 g", "price": 25, "p": 1, "f": 10, "c": 2, "fib": 0, "net": 2, "kcal": 102, "tags": ["GF"], "keto": "yes"},
  {"id": "i48", "cat": "sauce", "name": "BBQ Sauce", "por": "30 g", "price": 25, "p": 0, "f": 0, "c": 12, "fib": 0, "net": 12, "kcal": 48, "tags": ["VG"], "keto": "no"},
  {"id": "i49", "cat": "topping", "name": "Mozzarella Cheese", "por": "40 g", "price": 25, "p": 9, "f": 9, "c": 1, "fib": 0, "net": 1, "kcal": 121, "tags": ["GF"], "keto": "yes"},
  {"id": "i50", "cat": "topping", "name": "Mixed Nuts & Seeds", "por": "25 g", "price": 35, "p": 5, "f": 13, "c": 5, "fib": 2, "net": 3, "kcal": 153, "tags": ["GF"], "keto": "yes"},
  {"id": "i51", "cat": "topping", "name": "Homemade Plain Greek Yogurt", "por": "100 g", "price": 35, "p": 9, "f": 5, "c": 4, "fib": 0, "net": 4, "kcal": 97, "tags": ["GF"], "keto": "yes"},
  {"id": "i52", "cat": "topping", "name": "Feta Cheese", "por": "40 g", "price": 40, "p": 6, "f": 9, "c": 1, "fib": 0, "net": 1, "kcal": 109, "tags": ["GF"], "keto": "yes"},
  {"id": "i53", "cat": "topping", "name": "Shaved Parmesan Cheese", "por": "20 g", "price": 50, "p": 7, "f": 6, "c": 0, "fib": 0, "net": 0, "kcal": 82, "tags": ["GF"], "keto": "yes"},
];

export const ITEMS_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export const SLOTS = [
  { key: "base", label: "Base", hint: "Toast, waffle, rice or noodles", cats: ["base"] },
  { key: "protein", label: "Protein", hint: "Your main protein", cats: ["protein"] },
  { key: "protein2", label: "2nd protein", hint: "Optional extra protein", cats: ["protein"] },
  { key: "side1", label: "Side 1", hint: "Veg & extras", cats: ["side"] },
  { key: "side2", label: "Side 2", hint: "Another side", cats: ["side"] },
  { key: "sauce", label: "Sauce / dressing", hint: "Finish the dish", cats: ["sauce", "dressing"] },
  { key: "topping", label: "Topping", hint: "Cheese, nuts, yogurt", cats: ["topping"] },
];

export const GOALS = {
  Shredding: {
    key: "Shredding",
    kcal: [350, 500],
    p: [40, 60],
    net: 15,
    note: "Lean, high protein, low fat",
    short: "350–500 kcal · 40+ g protein",
    tagline: "Cut calories, keep the protein high",
  },
  Maintaining: {
    key: "Maintaining",
    kcal: [600, 900],
    p: [30, 60],
    net: 15,
    note: "Balanced keto for steady energy",
    short: "600–900 kcal · 30–60 g protein",
    tagline: "Balanced keto for steady energy",
  },
  Bulking: {
    key: "Bulking",
    kcal: [1000, 1200],
    p: [60, 100],
    net: 15,
    note: "High calorie, high protein",
    short: "1,000–1,200 kcal · 60+ g protein",
    tagline: "More fuel to build and grow",
  },
};

export const GOAL_ORDER = ["Shredding", "Maintaining", "Bulking"];

export const BUILDS = [
  {"goal": "Maintaining", "code": "M1", "name": "Salmon Pesto Bowl", "style": "Seafood", "items": ["i6", "i20", "i31", "i33", "i43"]},
  {"goal": "Maintaining", "code": "M2", "name": "Keto Benedict", "style": "Vegetarian · Breakfast", "items": ["i9", "i11", "i30", "i34", "i44"]},
  {"goal": "Maintaining", "code": "M3", "name": "Barramundi Beurre Blanc", "style": "Seafood", "items": ["i6", "i16", "i36", "i26", "i45", "i52"]},
  {"goal": "Maintaining", "code": "M4", "name": "Green Tofu Shirataki", "style": "Vegetarian", "items": ["i10", "i12", "i31", "i33", "i43", "i50"]},
  {"goal": "Maintaining", "code": "M5", "name": "Citrus Snapper Salad", "style": "Seafood · Light", "items": ["i4", "i18", "i35", "i33", "i21"]},
  {"goal": "Maintaining", "code": "M6", "name": "Sage Butter Snapper", "style": "Seafood", "items": ["i6", "i18", "i30", "i26", "i42", "i53"]},
  {"goal": "Maintaining", "code": "M7", "name": "Mediterranean Chicken", "style": "Meat", "items": ["i6", "i15", "i37", "i40", "i23"]},
  {"goal": "Maintaining", "code": "M8", "name": "Shakshuka Brunch", "style": "Vegetarian · Breakfast", "items": ["i9", "i11", "i39", "i33", "i42"]},
  {"goal": "Maintaining", "code": "M9", "name": "Bacon & Mushroom Waffle", "style": "Meat · Breakfast", "items": ["i5", "i13", "i11", "i30", "i26", "i41"]},
  {"goal": "Maintaining", "code": "M10", "name": "Tuna Avocado VCO Bowl", "style": "Seafood", "items": ["i6", "i17", "i34", "i35", "i23"]},
  {"goal": "Bulking", "code": "B1", "name": "Truffle Tenderloin Stack", "style": "Meat", "items": ["i5", "i19", "i30", "i33", "i47", "i53"]},
  {"goal": "Bulking", "code": "B2", "name": "Power Breakfast Plate", "style": "Meat · Breakfast", "items": ["i9", "i15", "i13", "i31", "i34", "i44"]},
  {"goal": "Bulking", "code": "B3", "name": "Salmon Royale", "style": "Seafood · Breakfast", "items": ["i9", "i20", "i11", "i31", "i33", "i44"]},
  {"goal": "Bulking", "code": "B4", "name": "Chicken Bacon Waffle", "style": "Meat", "items": ["i5", "i15", "i13", "i40", "i34", "i41", "i49"]},
  {"goal": "Bulking", "code": "B5", "name": "Double Egg Veggie Bulk", "style": "Vegetarian · Breakfast", "items": ["i9", "i11", "i11", "i31", "i33", "i44", "i52"]},
  {"goal": "Bulking", "code": "B6", "name": "Surf & Turf", "style": "Meat · Seafood", "items": ["i6", "i19", "i16", "i31", "i33", "i45"]},
  {"goal": "Bulking", "code": "B7", "name": "Snapper & Bacon Hollandaise", "style": "Seafood · Meat", "items": ["i9", "i18", "i13", "i30", "i34", "i44"]},
  {"goal": "Bulking", "code": "B8", "name": "Tofu & Egg Power Plate", "style": "Vegetarian", "items": ["i9", "i12", "i11", "i40", "i33", "i42"]},
  {"goal": "Bulking", "code": "B9", "name": "Chicken Tzatziki Stack", "style": "Meat", "items": ["i9", "i15", "i13", "i37", "i33", "i46", "i52"]},
  {"goal": "Bulking", "code": "B10", "name": "Tuna Steak & Eggs", "style": "Seafood · Breakfast", "items": ["i9", "i17", "i11", "i31", "i33", "i43", "i53"]},
  {"goal": "Shredding", "code": "S1", "name": "Sesame Tuna Shirataki", "style": "Seafood", "items": ["i10", "i17", "i32", "i35", "i25"]},
  {"goal": "Shredding", "code": "S2", "name": "Harissa Chicken Bowl", "style": "Meat", "items": ["i6", "i15", "i31", "i27", "i46"]},
  {"goal": "Shredding", "code": "S3", "name": "Snapper Ponzu Noodles", "style": "Seafood", "items": ["i10", "i18", "i36", "i35", "i25"]},
  {"goal": "Shredding", "code": "S4", "name": "Barramundi Harissa Slaw", "style": "Seafood", "items": ["i6", "i16", "i32", "i27", "i46"]},
  {"goal": "Shredding", "code": "S5", "name": "Crispy Tofu Slaw", "style": "Vegetarian", "items": ["i10", "i12", "i32", "i35", "i46"]},
  {"goal": "Shredding", "code": "S6", "name": "Lean Chicken Tzatziki", "style": "Meat", "items": ["i10", "i15", "i37", "i35", "i46"]},
  {"goal": "Shredding", "code": "S7", "name": "Tuna Garden Bowl", "style": "Seafood", "items": ["i6", "i17", "i35", "i27", "i25"]},
  {"goal": "Shredding", "code": "S8", "name": "Barramundi Citrus Greens", "style": "Seafood", "items": ["i10", "i16", "i31", "i35", "i21"]},
  {"goal": "Shredding", "code": "S9", "name": "Chicken Mushroom Ponzu", "style": "Meat", "items": ["i10", "i15", "i30", "i32", "i25"]},
  {"goal": "Shredding", "code": "S10", "name": "Greek Yogurt Chicken Bowl", "style": "Meat", "items": ["i10", "i15", "i26", "i35", "i46", "i51"]},
];
