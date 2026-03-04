import csv
import json
import re

# Read CSV
products = []
with open(r'C:\Users\Justin Mykel Egana\Downloads\sales2025 FEB-MARCH.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        if len(row) < 8:
            continue
        desc = row[4].strip()
        if not desc:
            continue
        qty = row[2].strip() or '0'
        bal = row[3].strip() or '0'
        cost = row[5].strip() or '0'
        sell = row[6].strip() or '0'
        unit = row[7].strip() or 'piece'
        try:
            beg = float(qty)
        except:
            beg = 0
        try:
            cur = float(bal)
        except:
            cur = 0
        try:
            cp = float(cost)
        except:
            cp = 0
        try:
            sp = float(sell)
        except:
            sp = 0
        products.append({
            'name': desc,
            'beginningStock': beg,
            'currentStock': cur,
            'costPrice': cp,
            'sellingPrice': sp,
            'unit': unit
        })

# Categorize


def categorize(name):
    n = name.upper()
    if any(k in n for k in ['CEMENT', 'HOLLOW', 'CHB', 'CONCRETE HOLLOW', 'SAND ', 'GRAVEL']):
        return 'Construction Materials'
    if any(k in n for k in ['ANGLE BAR', 'FLAT BAR', 'CHANNEL BAR', 'C-PULIN', 'C PULIN', 'DEFORM', 'STEEL']):
        return 'Steel & Metals'
    # Must check before electrical
    if any(k in n for k in ['COMMON NAIL', 'CONCRETE NAIL', 'UMBRELLA NAIL', 'FINISHING NAIL', 'WIRE NAIL']):
        return 'Fasteners'
    if any(k in n for k in ['GI WIRE', 'WIRE #', 'ROYU', 'OUTLET', 'SWITCH', 'CIRCUIT', 'BREAKER', 'JUNCTION', 'RECEPTACLE', 'ELECTRICAL TAPE', 'CONVENIENCE', 'UTILITY BOX', 'FLEXI', 'WIRE LOOM', 'COMMON WIRE', 'EXTENSION WIRE', 'THHN', 'ROMEX', 'PANEL BOARD', 'JUNCTION BOX']):
        if 'NAIL' in n:
            return 'Fasteners'
        return 'Electrical'
    if any(k in n for k in ['NAIL', 'SCREW', 'BOLT', 'NUT ', 'RIVET', 'TEX SCREW', 'TEX ', 'WASHER', 'U-BOLT', 'U BOLT']):
        return 'Fasteners'
    if any(k in n for k in ['PIPE', 'VALVE', 'FAUCET', 'NIPPLE', 'ELBOW', 'TEE PVC', 'TEE 1', 'TEE 3', 'TEE 2', 'COUPLING', 'BIDET', 'TEFLON', 'TUBULAR', 'ADAPTER', 'HOSE BIB', 'REDUCER', 'CONNECTOR PVC', 'WATER METER', 'PVC ', 'CLEAN OUT', 'WYE', 'MALE ADAPTER', 'FEMALE ADAPTER']):
        return 'Plumbing'
    if any(k in n for k in ['BOYSEN', 'LATEX', 'ROLLER', 'ENAMEL', 'PRIMER', 'FLATWALL', 'LACQUER', 'VARNISH', 'THINNER', 'TINTING', 'PATCHING', 'PERMACOAT', 'QUICK DRY', 'RAIN OR SHINE', 'COLORANT', 'BRUSH', 'AQUA EPOXY', 'PAINT', 'BABY ROLLER']):
        return 'Paint & Accessories'
    if any(k in n for k in ['TAPE', 'MIGHTY BOND', 'SUPER GLUE', 'VULCA', 'ELASTO SEAL', 'EPOXY', 'SILICONE', 'SEALANT', 'ADHESIVE']):
        if 'TEFLON' in n:
            return 'Plumbing'
        if 'ELECTRICAL TAPE' in n:
            return 'Electrical'
        return 'Adhesives & Sealants'
    if any(k in n for k in ['LED', 'BULB', 'DOWNLIGHT', 'PANEL LIGHT', 'CEILING LIGHT', 'CANDLE', 'LAMP', 'LIGHTING', 'T8 TUBE']):
        return 'Lighting'
    if any(k in n for k in ['GI SHEET', 'ROOF', 'GUTTER', 'FLASHING', 'RIDGE', 'CORRUGATED', 'YERO', 'SPANDEK', 'POLYCARBONATE', 'KISAME', 'INSULATION']):
        return 'Roofing & Ceiling'
    if any(k in n for k in ['HINGE', 'PADLOCK', 'BARREL BOLT', 'HASP', 'DOOR', 'GATE', 'CABINET', 'CASTER', 'TOWER BOLT', 'PULL HANDLE', 'LATCH', 'KNOB', 'LOCKSET', 'DEAD BOLT']):
        return 'Door & Cabinet Hardware'
    if any(k in n for k in ['HACKSAW', 'BLADE', 'DRILL', 'GRINDING', 'CUTTING DISC', 'PLIER', 'WRENCH', 'HAMMER', 'LEVEL', 'TROWEL', 'CHISEL', 'TAPE MEASURE', 'METER TAPE', 'SCREWDRIVER']):
        return 'Tools'
    if any(k in n for k in ['GLOVE', 'SAFETY', 'MASK', 'HELMET', 'GOGGLES', 'RAINCOAT', 'FACE SHIELD']):
        return 'Safety Equipment'
    return 'General Hardware'


# Category code prefixes - matching screenshot
code_prefixes = {
    'Construction Materials': 'CON-CMT',
    'Steel & Metals': 'STL-AGB',
    'Fasteners': 'FST-SCR',
    'Electrical': 'ELC-WIR',
    'Plumbing': 'PLM-PVC',
    'Paint & Accessories': 'PNT-ACC',
    'Adhesives & Sealants': 'ADH-SEL',
    'Lighting': 'LGT-LED',
    'Roofing & Ceiling': 'ROF-SHT',
    'Door & Cabinet Hardware': 'HDW-DOR',
    'Tools': 'TLS-GEN',
    'Safety Equipment': 'SFT-EQP',
    'General Hardware': 'ACC-UTL',
}

cat_descriptions = {
    'Construction Materials': 'Cement, hollow blocks, sand, gravel, and other construction materials',
    'Steel & Metals': 'Angle bars, flat bars, deformed bars, C-purlins, GI wire',
    'Fasteners': 'Nails, screws, bolts, nuts, rivets, and other fastening hardware',
    'Electrical': 'Wires, cables, switches, outlets, breakers, junction boxes',
    'Plumbing': 'Pipes, fittings, faucets, valves, adaptors',
    'Paint & Accessories': 'Paint, primers, thinners, brushes, rollers',
    'Adhesives & Sealants': 'Tapes, sealants, epoxy, adhesives, bonds',
    'Lighting': 'LED bulbs, downlights, panel lights, fluorescent tubes',
    'Roofing & Ceiling': 'GI sheets, ridge rolls, gutters, ceiling materials',
    'Door & Cabinet Hardware': 'Hinges, locks, bolts, handles, knobs, casters',
    'Tools': 'Hacksaw blades, drill bits, grinding discs, hand tools',
    'Safety Equipment': 'Gloves, masks, helmets, goggles, protective gear',
    'General Hardware': 'Bearings, hooks, turnbuckles, and miscellaneous items',
}

# Group products by category
categorized = {}
for p in products:
    cat = categorize(p['name'])
    categorized.setdefault(cat, [])
    categorized[cat].append(p)

# Generate product code for each product
all_products_with_codes = []
for cat in sorted(categorized.keys()):
    prefix = code_prefixes.get(cat, 'ACC-UTL')
    for i, p in enumerate(categorized[cat], 1):
        code = f"{prefix}-{i:03d}"
        all_products_with_codes.append({
            'category': cat,
            'productCode': code,
            **p
        })

# Compute low stock threshold: ~5% of beginning stock or 5, whichever is greater


def get_threshold(beg):
    t = max(5, int(beg * 0.05))
    # Round to nice number
    if t > 50:
        t = (t // 10) * 10
    return min(t, 100)

# Generate seed.service.ts


def escape_ts(s):
    return s.replace("'", "\\'").replace('"', '\\"')


lines = []
lines.append(
    "import { Injectable, OnModuleInit, Logger } from '@nestjs/common';")
lines.append("import { InjectRepository } from '@nestjs/typeorm';")
lines.append("import { Repository } from 'typeorm';")
lines.append("import { UsersService } from '../users/users.service';")
lines.append("import { Category } from '../categories/category.entity';")
lines.append("import { Product } from '../products/product.entity';")
lines.append("")
lines.append("@Injectable()")
lines.append("export class SeedService implements OnModuleInit {")
lines.append("  private readonly logger = new Logger(SeedService.name);")
lines.append("")
lines.append("  constructor(")
lines.append("    private usersService: UsersService,")
lines.append("    @InjectRepository(Category)")
lines.append("    private categoriesRepo: Repository<Category>,")
lines.append("    @InjectRepository(Product)")
lines.append("    private productsRepo: Repository<Product>,")
lines.append("  ) {}")
lines.append("")
lines.append("  async onModuleInit() {")
lines.append("    await this.seedAdmin();")
lines.append("    await this.seedCategories();")
lines.append("    await this.seedProducts();")
lines.append("  }")
lines.append("")
lines.append("  private async seedAdmin() {")
lines.append(
    "    const existingAdmin = await this.usersService.findByUsername('admin');")
lines.append("    if (!existingAdmin) {")
lines.append("      await this.usersService.createUser(")
lines.append("        'admin',")
lines.append("        'admin123',")
lines.append("        'A&D Hardware Admin',")
lines.append("      );")
lines.append(
    "      this.logger.log('Default admin user created (admin / admin123)');")
lines.append("    }")
lines.append("  }")
lines.append("")
lines.append("  private async seedCategories() {")
lines.append("    const count = await this.categoriesRepo.count();")
lines.append("    if (count > 0) return;")
lines.append("")
lines.append("    const categories = [")

for cat in sorted(cat_descriptions.keys()):
    desc = cat_descriptions[cat]
    lines.append(
        f"      {{ name: '{escape_ts(cat)}', description: '{escape_ts(desc)}' }},")

lines.append("    ];")
lines.append("")
lines.append("    for (const cat of categories) {")
lines.append(
    "      await this.categoriesRepo.save(this.categoriesRepo.create(cat));")
lines.append("    }")
lines.append("    this.logger.log('Default categories seeded');")
lines.append("  }")
lines.append("")
lines.append("  private async seedProducts() {")
lines.append("    const count = await this.productsRepo.count();")
lines.append("    if (count > 0) return;")
lines.append("")
lines.append("    const categories = await this.categoriesRepo.find();")
lines.append(
    "    const catMap = new Map(categories.map((c) => [c.name, c.id]));")
lines.append("")
lines.append("    const products = [")

for p in all_products_with_codes:
    name_escaped = escape_ts(p['name'])
    cat_escaped = escape_ts(p['category'])
    threshold = get_threshold(p['beginningStock'])
    unit = p['unit'] if p['unit'] else 'piece'
    lines.append(f"      {{ productCode: '{p['productCode']}', name: '{name_escaped}', unit: '{unit}', costPrice: {p['costPrice']}, sellingPrice: {p['sellingPrice']}, beginningStock: {p['beginningStock']}, stock: {p['currentStock']}, lowStockThreshold: {threshold}, categoryId: catMap.get('{cat_escaped}') }},")

lines.append("    ];")
lines.append("")
lines.append("    // Batch insert for performance")
lines.append("    const batchSize = 50;")
lines.append("    for (let i = 0; i < products.length; i += batchSize) {")
lines.append("      const batch = products.slice(i, i + batchSize);")
lines.append(
    "      const entities = batch.map((p) => this.productsRepo.create(p as any));")
lines.append("      await this.productsRepo.save(entities);")
lines.append("    }")
lines.append(
    f"    this.logger.log(`Default ${{products.length}} products seeded from A&D inventory`);")
lines.append("  }")
lines.append("}")
lines.append("")

# Write seed file
output_path = r'C:\Users\Justin Mykel Egana\OneDrive\Desktop\A-and-D-Hardware-Web\backend\src\seed\seed.service.ts'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(
    f"Generated seed with {len(all_products_with_codes)} products across {len(categorized)} categories")
for cat in sorted(categorized.keys()):
    print(f"  {cat}: {len(categorized[cat])} products")
