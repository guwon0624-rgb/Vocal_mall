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

const researchedProducts = [
  {
    kind: "product",
    sku: "SHURE-SM7B",
    title: "SHURE SM7B 스튜디오 보컬 마이크",
    description:
      "방송, 팟캐스트와 전문 보컬 녹음에 널리 쓰이는 카디오이드 다이나믹 마이크입니다. 50Hz~20kHz의 넓고 평탄한 응답, 베이스 롤오프와 프레즌스 부스트, 에어 서스펜션 쇼크 마운트와 전자기 험 차폐를 갖췄습니다. 감도가 낮아 안정적인 사용을 위해 60dB 이상의 게인을 제공하는 프리앰프 또는 인라인 부스터 사용을 권장합니다.",
    price: 714000,
    imageUrl:
      "https://products.shureweb.eu/shure_product_db/product_main_images/files/3ac/40e/15-/setcard/cb0c8564fc691fe2ff3d2b67889ab1c2.jpeg",
    category: "마이크",
    badge: "STUDIO",
    brand: "SHURE",
    specs: [
      { label: "TYPE", value: "다이나믹 · 카디오이드" },
      { label: "RESPONSE", value: "50Hz–20kHz" },
      { label: "SENSITIVITY", value: "-59dBV/Pa" },
      { label: "IMPEDANCE", value: "150Ω" },
      { label: "CONNECTOR", value: "3-pin XLR" },
      { label: "WEIGHT", value: "약 765g" },
    ],
    sourceUrl: "https://www.shure.com/en-US/products/microphones/sm7b",
    stock: 7,
    featured: true,
    displayOrder: 20,
  },
  {
    kind: "product",
    sku: "SENNHEISER-E935",
    title: "SENNHEISER e 935 다이나믹 보컬 마이크",
    description:
      "라이브 무대에서 자연스럽고 또렷한 보컬을 전달하도록 설계된 카디오이드 다이나믹 마이크입니다. 투명한 고역과 따뜻한 중저역, 높은 피드백 억제력으로 밀도 높은 밴드 믹스에서도 보컬의 존재감을 살립니다. 쇼크 마운트 캡슐과 험 보상 코일, 견고한 금속 하우징을 적용해 핸들링 노이즈와 투어 환경에 강합니다.",
    price: 412000,
    imageUrl:
      "https://sennshop.co.kr/web/product/big/202507/e1734add095dfef90c7a5c1dbfd4184a.jpg",
    category: "마이크",
    badge: "LIVE",
    brand: "SENNHEISER",
    specs: [
      { label: "TYPE", value: "다이나믹 · 카디오이드" },
      { label: "RESPONSE", value: "40Hz–18kHz" },
      { label: "SENSITIVITY", value: "2.8mV/Pa" },
      { label: "IMPEDANCE", value: "350Ω" },
      { label: "CONNECTOR", value: "3-pin XLR" },
      { label: "WEIGHT", value: "355g" },
    ],
    sourceUrl:
      "https://www.sennheiser.com/ko-kr/catalog/products/microphones/e-935/e-935-009421",
    stock: 12,
    featured: true,
    displayOrder: 21,
  },
  {
    kind: "product",
    sku: "ADAM-T5V-SINGLE",
    title: "ADAM AUDIO T5V 액티브 모니터 스피커 (1통)",
    description:
      "작은 작업실과 홈 스튜디오에 최적화된 2웨이 액티브 니어필드 모니터입니다. 5인치 폴리프로필렌 우퍼와 HPS 웨이브가이드가 결합된 U-ART 리본 트위터가 45Hz~25kHz를 재생합니다. 우퍼 50W와 트위터 20W의 Class-D 앰프, XLR·RCA 입력과 고·저역 셸프 EQ를 내장했습니다. 판매 단위는 1통입니다.",
    price: 349000,
    imageUrl:
      "https://www.adam-audio.com/content/uploads/2023/04/adam-audio-t5v-studio-monitor-featured-image.png",
    category: "모니터 스피커",
    badge: "MONITOR",
    brand: "ADAM AUDIO",
    specs: [
      { label: "SYSTEM", value: "2웨이 액티브 니어필드" },
      { label: "DRIVERS", value: "5인치 우퍼 · 1.9인치 U-ART 트위터" },
      { label: "RESPONSE", value: "45Hz–25kHz (-6dB)" },
      { label: "POWER", value: "50W + 20W Class-D" },
      { label: "INPUT", value: "XLR · RCA" },
      { label: "SIZE", value: "298 × 179 × 297mm · 5.7kg" },
    ],
    sourceUrl: "https://www.adam-audio.com/en/t-series/t5v/",
    stock: 10,
    featured: true,
    displayOrder: 22,
  },
  {
    kind: "product",
    sku: "ROLAND-FP30X-BK",
    title: "ROLAND FP-30X 포터블 디지털 피아노",
    description:
      "SuperNATURAL 피아노 음원과 이스케이프먼트·아이보리 필을 갖춘 88건반 PHA-4 Standard 해머 액션을 탑재했습니다. 최대 256음 동시발음, 11W×2 스테레오 스피커와 Bluetooth 오디오·MIDI, USB 오디오·MIDI를 지원해 가정 연습부터 소규모 공연과 레코딩까지 활용할 수 있습니다. 보면대, 어댑터와 DP-2 페달이 포함됩니다.",
    price: 1130000,
    imageUrl:
      "https://static.roland.com/assets/images/products/main/fp-30x-bk_top_main.jpg",
    category: "디지털 피아노",
    badge: "BEST",
    brand: "ROLAND",
    specs: [
      { label: "KEYBOARD", value: "88키 PHA-4 Standard 해머 액션" },
      { label: "SOUND", value: "SuperNATURAL Piano · 최대 256음" },
      { label: "SPEAKER", value: "12cm × 2 · 11W × 2" },
      { label: "WIRELESS", value: "Bluetooth Audio 3.0 · MIDI 4.0" },
      { label: "CONNECTION", value: "USB Audio/MIDI · Line Out · 헤드폰 2개" },
      { label: "SIZE", value: "1,300 × 284 × 151mm · 14.8kg" },
    ],
    sourceUrl: "https://www.roland.com/global/products/fp-30x/",
    stock: 4,
    featured: false,
    displayOrder: 23,
  },
  {
    kind: "product",
    sku: "YAMAHA-FG800-NT",
    title: "YAMAHA FG800 어쿠스틱 기타",
    description:
      "입문자부터 꾸준히 연주할 수 있는 야마하의 표준 드레드넛 어쿠스틱 기타입니다. 솔리드 스프루스 상판과 나토·오쿠메 후판 및 측판, 새롭게 설계된 스캘럽드 브레이싱이 견고하면서 균형 잡힌 울림을 제공합니다. 650mm 스케일과 43mm 너트 폭으로 코드 스트로크와 기본 연주에 편안하며 전통적인 내추럴 마감을 적용했습니다.",
    price: 420000,
    imageUrl:
      "https://usa.yamaha.com/files/a05_modulate_OGP_3e4db024cf14643d0d84bc00728c2d48.jpg",
    category: "어쿠스틱 기타",
    badge: "STARTER",
    brand: "YAMAHA",
    specs: [
      { label: "BODY", value: "드레드넛 스타일" },
      { label: "TOP", value: "솔리드 스프루스" },
      { label: "BACK/SIDE", value: "나토 · 오쿠메" },
      { label: "BRACING", value: "스캘럽드 브레이싱" },
      { label: "SCALE", value: "650mm" },
      { label: "NUT", value: "43mm" },
    ],
    sourceUrl:
      "https://kr.yamaha.com/ko/musical-instruments/guitars-basses-amps/products/acoustic-guitars/fg-series/fg-800/lineup.html",
    stock: 8,
    featured: false,
    displayOrder: 24,
  },
];

const skuByTitle = new Map(
  [...catalogSeed, ...researchedProducts]
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

  if (itemCount === 0) {
    await CatalogItem.insertMany(catalogSeed);
    console.log("기본 강의 및 상품 데이터가 등록되었습니다.");
  }

  const result = await CatalogItem.bulkWrite(
    researchedProducts.map((product) => ({
      updateOne: {
        filter: { sku: product.sku },
        update: { $setOnInsert: product },
        upsert: true,
      },
    })),
  );

  if (result.upsertedCount > 0) {
    console.log(`조사 상품 ${result.upsertedCount}개가 등록되었습니다.`);
  }
};

module.exports = seedCatalog;
