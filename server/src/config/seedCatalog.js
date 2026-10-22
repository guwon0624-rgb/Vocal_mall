const CatalogItem = require("../models/CatalogItem");

const catalogSeed = [
  {
    kind: "course",
    title: "성종 발견 클래스",
    description:
      "성대의 길이와 무게를 분석하고 내 목소리에 맞는 발성 방향을 찾는 입문 과정입니다.",
    price: 180000,
    imageUrl:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=85",
    category: "보컬 진단",
    badge: "BEST",
    instructor: "전문 보컬 코치",
    duration: "4주 · 8회",
    level: "입문",
    featured: true,
    displayOrder: 1,
  },
  {
    kind: "course",
    title: "진성두성 마스터",
    description:
      "호흡 압력과 성대 접촉을 안정시키며 힘으로 밀지 않는 진성두성을 체득합니다.",
    price: 320000,
    imageUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=85",
    category: "발성 심화",
    badge: "SIGNATURE",
    instructor: "시니어 코치",
    duration: "8주 · 16회",
    level: "중급",
    featured: true,
    displayOrder: 2,
  },
  {
    kind: "course",
    title: "아티스트 퍼포먼스",
    description:
      "곡 해석부터 마이크 테크닉, 무대 표현까지 실제 공연을 위한 감각을 완성합니다.",
    price: 420000,
    imageUrl:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85",
    category: "퍼포먼스",
    badge: "PRO",
    instructor: "퍼포먼스 디렉터",
    duration: "10주 · 20회",
    level: "고급",
    displayOrder: 3,
  },
  {
    kind: "product",
    sku: "VM-HEADPHONE-001",
    title: "Studio Monitor Headphones",
    description:
      "보컬 디테일과 호흡 소리를 정확히 모니터링할 수 있는 밀폐형 헤드폰입니다.",
    price: 189000,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
    category: "헤드폰",
    badge: "RECOMMEND",
    brand: "VOICE LAB",
    stock: 18,
    featured: true,
    displayOrder: 1,
  },
  {
    kind: "product",
    sku: "VM-MIC-001",
    title: "Vocal Condenser Microphone",
    description:
      "넓은 다이내믹 레인지와 선명한 고역으로 보컬 녹음에 최적화된 콘덴서 마이크입니다.",
    price: 349000,
    imageUrl:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=85",
    category: "마이크",
    badge: "NEW",
    brand: "SONORA",
    stock: 9,
    featured: true,
    displayOrder: 2,
  },
  {
    kind: "product",
    sku: "VM-INTERFACE-001",
    title: "Compact Audio Interface",
    description:
      "홈 레코딩에 필요한 프리앰프와 안정적인 모니터링 환경을 제공하는 오디오 인터페이스입니다.",
    price: 279000,
    imageUrl:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=85",
    category: "오디오 인터페이스",
    brand: "WAVEFORM",
    stock: 12,
    displayOrder: 3,
  },
  {
    kind: "product",
    sku: "VM-MONITOR-001",
    title: "Nearfield Monitor Pair",
    description:
      "작은 공간에서도 균형 잡힌 보컬과 반주 밸런스를 들려주는 니어필드 모니터 스피커입니다.",
    price: 598000,
    imageUrl:
      "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=1200&q=85",
    category: "모니터 스피커",
    brand: "ACOUSTIC ONE",
    stock: 6,
    displayOrder: 4,
  },
];

const skuByTitle = new Map(
  catalogSeed
    .filter((item) => item.kind === "product")
    .map((item) => [item.title, item.sku]),
);

const backfillProductSkus = async () => {
  const products = await CatalogItem.find({
    kind: "product",
    $or: [{ sku: { $exists: false } }, { sku: "" }],
  }).select("_id title");

  await Promise.all(
    products.map((product) =>
      CatalogItem.updateOne(
        { _id: product._id },
        {
          $set: {
            sku:
              skuByTitle.get(product.title) ||
              `VM-${product._id.toString().slice(-8).toUpperCase()}`,
          },
        },
      ),
    ),
  );
};

const seedCatalog = async () => {
  await backfillProductSkus();

  const itemCount = await CatalogItem.countDocuments();

  if (itemCount > 0) {
    return;
  }

  await CatalogItem.insertMany(catalogSeed);
  console.log("기본 강의 및 상품 데이터가 등록되었습니다.");
};

module.exports = seedCatalog;
