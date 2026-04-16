import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import pkg from "@prisma/client";
import bcrypt from "bcrypt";
import ws from "ws";

const { PrismaClient } = pkg;
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL_NEON;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const GEOGRAPHY = [
  {
    name: "Luzon",
    regions: [
      {
        name: "National Capital Region",
        code: "NCR",
        provinces: [
          {
            name: "Metro Manila",
            municipalities: [
              "Caloocan", "Las Piñas", "Makati", "Malabon", "Mandaluyong",
              "Manila", "Marikina", "Muntinlupa", "Navotas", "Parañaque",
              "Pasay", "Pasig", "Pateros", "Quezon City", "San Juan",
              "Taguig", "Valenzuela",
            ],
          },
        ],
      },
      {
        name: "Cordillera Administrative Region",
        code: "CAR",
        provinces: [
          {
            name: "Abra",
            municipalities: ["Bangued", "Boliney", "Bucay", "Bucloc", "Daguioman"],
          },
          {
            name: "Benguet",
            municipalities: ["Baguio City", "La Trinidad", "Itogon", "Sablan", "Tuba"],
          },
          {
            name: "Ifugao",
            municipalities: ["Lagawe", "Aguinaldo", "Alfonso Lista", "Asipulo", "Banaue"],
          },
        ],
      },
      {
        name: "Ilocos Region",
        code: "I",
        provinces: [
          {
            name: "Ilocos Norte",
            municipalities: ["Laoag City", "Batac City", "Paoay", "Pagudpud", "Sarrat"],
          },
          {
            name: "Ilocos Sur",
            municipalities: ["Vigan City", "Candon City", "Narvacan", "Santa", "Tagudin"],
          },
          {
            name: "La Union",
            municipalities: ["San Fernando City", "Agoo", "Bauang", "Naguilian", "Rosario"],
          },
          {
            name: "Pangasinan",
            municipalities: ["Dagupan City", "San Carlos City", "Urdaneta City", "Alaminos City", "Lingayen"],
          },
        ],
      },
      {
        name: "Cagayan Valley",
        code: "II",
        provinces: [
          {
            name: "Cagayan",
            municipalities: ["Tuguegarao City", "Aparri", "Gonzaga", "Lal-lo", "Sanchez-Mira"],
          },
          {
            name: "Isabela",
            municipalities: ["Ilagan City", "Cauayan City", "Santiago City", "Cabagan", "Tumauini"],
          },
          {
            name: "Nueva Vizcaya",
            municipalities: ["Bayombong", "Bambang", "Kasibu", "Solano", "Villaverde"],
          },
        ],
      },
      {
        name: "Central Luzon",
        code: "III",
        provinces: [
          {
            name: "Bulacan",
            municipalities: ["Malolos City", "Meycauayan City", "San Jose del Monte City", "Balagtas", "Bocaue"],
          },
          {
            name: "Pampanga",
            municipalities: ["San Fernando City", "Angeles City", "Mabalacat City", "Apalit", "Candaba"],
          },
          {
            name: "Tarlac",
            municipalities: ["Tarlac City", "Capas", "Concepcion", "Gerona", "Paniqui"],
          },
          {
            name: "Zambales",
            municipalities: ["Olongapo City", "Iba", "San Antonio", "San Narciso", "Subic"],
          },
        ],
      },
      {
        name: "CALABARZON",
        code: "IV-A",
        provinces: [
          {
            name: "Batangas",
            municipalities: ["Batangas City", "Lipa City", "Tanauan City", "Balayan", "Nasugbu"],
          },
          {
            name: "Cavite",
            municipalities: ["Cavite City", "Bacoor City", "Dasmariñas City", "General Trias City", "Imus City"],
          },
          {
            name: "Laguna",
            municipalities: ["San Pablo City", "Calamba City", "Santa Rosa City", "Biñan City", "Cabuyao City"],
          },
          {
            name: "Quezon",
            municipalities: ["Lucena City", "Tayabas City", "Gumaca", "Infanta", "Pagbilao"],
          },
          {
            name: "Rizal",
            municipalities: ["Antipolo City", "Cainta", "Taytay", "San Mateo", "Rodriguez"],
          },
        ],
      },
      {
        name: "MIMAROPA",
        code: "IV-B",
        provinces: [
          {
            name: "Marinduque",
            municipalities: ["Boac", "Buenavista", "Gasan", "Mogpog", "Santa Cruz"],
          },
          {
            name: "Palawan",
            municipalities: ["Puerto Princesa City", "Brooke's Point", "Coron", "El Nido", "Taytay"],
          },
        ],
      },
      {
        name: "Bicol Region",
        code: "V",
        provinces: [
          {
            name: "Albay",
            municipalities: ["Legazpi City", "Ligao City", "Tabaco City", "Bacacay", "Camalig"],
          },
          {
            name: "Camarines Sur",
            municipalities: ["Naga City", "Iriga City", "Baao", "Bombon", "Buhi"],
          },
          {
            name: "Sorsogon",
            municipalities: ["Sorsogon City", "Barcelona", "Bulan", "Gubat", "Irosin"],
          },
        ],
      },
    ],
  },
  {
    name: "Visayas",
    regions: [
      {
        name: "Western Visayas",
        code: "VI",
        provinces: [
          {
            name: "Aklan",
            municipalities: ["Kalibo", "Boracay (Malay)", "Ibajay", "Lezo", "Makato"],
          },
          {
            name: "Antique",
            municipalities: ["San Jose de Buenavista", "Sibalom", "Barbaza", "Bugasong", "Culasi"],
          },
          {
            name: "Capiz",
            municipalities: ["Roxas City", "Dao", "Dumalag", "Dumarao", "Ivisan"],
          },
          {
            name: "Guimaras",
            municipalities: ["Jordan", "Buenavista", "Nueva Valencia", "San Lorenzo", "Sibunag"],
          },
          {
            name: "Iloilo",
            municipalities: ["Iloilo City", "Passi City", "Ajuy", "Alimodian", "Anilao"],
          },
          {
            name: "Negros Occidental",
            municipalities: ["Bacolod City", "Bago City", "Cadiz City", "Escalante City", "Himamaylan City"],
          },
        ],
      },
      {
        name: "Central Visayas",
        code: "VII",
        provinces: [
          {
            name: "Bohol",
            municipalities: ["Tagbilaran City", "Alicia", "Anda", "Batuan", "Bilar"],
          },
          {
            name: "Cebu",
            municipalities: ["Cebu City", "Lapu-Lapu City", "Mandaue City", "Carcar City", "Danao City"],
          },
          {
            name: "Negros Oriental",
            municipalities: ["Dumaguete City", "Bais City", "Bayawan City", "Canlaon City", "Guihulngan City"],
          },
          {
            name: "Siquijor",
            municipalities: ["Siquijor", "Enrique Villanueva", "Larena", "Lazi", "Maria"],
          },
        ],
      },
      {
        name: "Eastern Visayas",
        code: "VIII",
        provinces: [
          {
            name: "Leyte",
            municipalities: ["Tacloban City", "Baybay City", "Ormoc City", "Abuyog", "Alangalang"],
          },
          {
            name: "Samar",
            municipalities: ["Catbalogan City", "Calbayog City", "Allen", "Basey", "Calbiga"],
          },
          {
            name: "Eastern Samar",
            municipalities: ["Borongan City", "Arteche", "Balangiga", "Balangkayan", "Can-avid"],
          },
        ],
      },
    ],
  },
  {
    name: "Mindanao",
    regions: [
      {
        name: "Zamboanga Peninsula",
        code: "IX",
        provinces: [
          {
            name: "Zamboanga del Norte",
            municipalities: ["Dipolog City", "Dapitan City", "Liloy", "Manukan", "Sindangan"],
          },
          {
            name: "Zamboanga del Sur",
            municipalities: ["Pagadian City", "Aurora", "Bayog", "Dimataling", "Dumalinao"],
          },
          {
            name: "Zamboanga Sibugay",
            municipalities: ["Ipil", "Alicia", "Buug", "Diplahan", "Imelda"],
          },
        ],
      },
      {
        name: "Northern Mindanao",
        code: "X",
        provinces: [
          {
            name: "Bukidnon",
            municipalities: ["Malaybalay City", "Valencia City", "Cabanglasan", "Dangcagan", "Don Carlos"],
          },
          {
            name: "Cagayan de Oro (Misamis Oriental)",
            municipalities: ["Cagayan de Oro City", "Gingoog City", "Balingasag", "Claveria", "Initao"],
          },
          {
            name: "Misamis Occidental",
            municipalities: ["Oroquieta City", "Ozamiz City", "Tangub City", "Aloran", "Baliangao"],
          },
        ],
      },
      {
        name: "Davao Region",
        code: "XI",
        provinces: [
          {
            name: "Davao del Norte",
            municipalities: ["Tagum City", "Panabo City", "Samal City", "Asuncion", "Braulio E. Dujali"],
          },
          {
            name: "Davao del Sur",
            municipalities: ["Davao City", "Digos City", "Bansalan", "Don Marcelino", "Hagonoy"],
          },
          {
            name: "Davao Oriental",
            municipalities: ["Mati City", "Baganga", "Banaybanay", "Boston", "Caraga"],
          },
        ],
      },
      {
        name: "SOCCSKSARGEN",
        code: "XII",
        provinces: [
          {
            name: "Cotabato",
            municipalities: ["Kidapawan City", "Alamada", "Aleosan", "Antipas", "Arakan"],
          },
          {
            name: "Sarangani",
            municipalities: ["Alabel", "Glan", "Kiamba", "Maasim", "Maitum"],
          },
          {
            name: "South Cotabato",
            municipalities: ["Koronadal City", "General Santos City", "Banga", "Lake Sebu", "Norala"],
          },
        ],
      },
      {
        name: "Caraga",
        code: "XIII",
        provinces: [
          {
            name: "Agusan del Norte",
            municipalities: ["Butuan City", "Cabadbaran City", "Buenavista", "Carmen", "Jabonga"],
          },
          {
            name: "Surigao del Norte",
            municipalities: ["Surigao City", "Dapa", "Del Carmen", "General Luna", "Pilar"],
          },
        ],
      },
      {
        name: "Bangsamoro",
        code: "BARMM",
        provinces: [
          {
            name: "Maguindanao del Norte",
            municipalities: ["Cotabato City", "Datu Odin Sinsuat", "Kabuntalan", "Matanog", "Parang"],
          },
          {
            name: "Lanao del Sur",
            municipalities: ["Marawi City", "Bacolod-Kalawi", "Balabagan", "Balindong", "Binidayan"],
          },
        ],
      },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding geography data...");

  for (const islandData of GEOGRAPHY) {
    const islandGroup = await prisma.islandGroup.upsert({
      where: { name: islandData.name },
      update: {},
      create: { name: islandData.name },
    });
    console.log(`  ✓ Island group: ${islandGroup.name}`);

    for (const regionData of islandData.regions) {
      const region = await prisma.region.upsert({
        where: { code: regionData.code },
        update: { name: regionData.name },
        create: {
          name: regionData.name,
          code: regionData.code,
          islandGroupId: islandGroup.id,
        },
      });
      console.log(`    ✓ Region: ${region.name}`);

      for (const provinceData of regionData.provinces) {
        const province = await prisma.province.upsert({
          where: { id: (await prisma.province.findFirst({ where: { name: provinceData.name, regionId: region.id } }))?.id ?? 0 },
          update: {},
          create: {
            name: provinceData.name,
            regionId: region.id,
          },
        });
        console.log(`      ✓ Province: ${province.name}`);

        for (const municipalityName of provinceData.municipalities) {
          const existing = await prisma.municipality.findFirst({
            where: { name: municipalityName, provinceId: province.id },
          });
          if (!existing) {
            await prisma.municipality.create({
              data: { name: municipalityName, provinceId: province.id },
            });
          }
        }
        console.log(`        ✓ ${provinceData.municipalities.length} municipalities seeded`);
      }
    }
  }

  // ─── Seed SuperAdmin ────────────────────────────────────────────────────────
  console.log("\n👤 Seeding SuperAdmin...");

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: "superadmin@esumbong.gov.ph" },
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash("SuperAdmin@2025!", 10);
    await prisma.user.create({
      data: {
        fullname: "Super Administrator",
        email: "superadmin@esumbong.gov.ph",
        password: hashedPassword,
        address: "National",
        contactNumber: "09000000000",
        type: "superAdmin",
        isVerified: true,
        isActive: true,
      },
    });
    console.log("  ✓ SuperAdmin created → email: superadmin@esumbong.gov.ph | password: SuperAdmin@2025!");
    console.log("  ⚠  Change this password immediately after first login.");
  } else {
    console.log("  ✓ SuperAdmin already exists, skipped.");
  }

  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });