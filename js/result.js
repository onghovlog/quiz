function getApiUrl() {
  if (window.location.port === "5000" || window.location.port === "5500") {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }
  return window.location.origin;
}

const API = getApiUrl();
const data = JSON.parse(localStorage.getItem("wmResult") || "null");
if (!data) {
  location.href = "index.html";
}

const trackNames = {
  itGeneral: "🔮 ĐA VŨ TRỤ CNTT",
  gameDev: "🎮 CHUYÊN NGÀNH GAME",
  aiFuture: "🤖 CHUYÊN NGÀNH AI & DATA",
  webDev: "🌐 CHUYÊN NGÀNH WEB & CLOUD"
};

// Fallback universe metadata dictionary
const defaultUniversesMeta = {
  itGeneral: {
    aiFuture: {
      name: "AI ENGINEER",
      icon: "🤖",
      subtitle: "Kỹ Sư Trí Tuệ Nhân Tạo & Machine Learning",
      desc: "Bạn đam mê tự động hóa, mô hình trí tuệ nhân tạo và biến dữ liệu thành các giải pháp thông minh vượt trội.",
      skills: ["Python", "PyTorch / TensorFlow", "LLM / LangChain", "Prompt Engineering", "Data Analytics"],
      advice: "Hãy tập trung vào thuật toán học máy, xây dựng AI Agent và tích hợp mô hình ngôn ngữ lớn vào sản phẩm thực tế."
    },
    gameDev: {
      name: "GAME DEVELOPER",
      icon: "🎮",
      subtitle: "Nhà Phát Triển & Sáng Tạo Game",
      desc: "Bạn có niềm đam mê mãnh liệt với trải nghiệm giải trí tương tác, logic trò chơi, đồ họa 3D và vật lý ảo.",
      skills: ["Unity / C#", "Unreal Engine / C++", "Blender / 3D Art", "Game Physics", "Level Design"],
      advice: "Hãy bắt tay làm ngay các dự án game mini (Game Jam), luyện tư duy thuật toán hình học và làm chủ Unity hoặc Unreal."
    },
    webDev: {
      name: "WEB & CLOUD ARCHITECT",
      icon: "🌐",
      subtitle: "Kỹ Sư Phát Triển Web & Hệ Thống Đám Mây",
      desc: "Bạn yêu thích xây dựng những nền tảng web mạnh mẽ, giao diện mượt mà và hệ thống backend chịu tải hàng triệu người dùng.",
      skills: ["JavaScript / TypeScript", "React / Next.js", "Node.js / Go", "PostgreSQL / Redis", "Docker / AWS"],
      advice: "Làm chủ kiến trúc Fullstack, tối ưu hiệu năng web và xây dựng các hệ thống microservices trên nền tảng đám mây."
    },
    cyberSec: {
      name: "CYBER SECURITY DEFENDER",
      icon: "🛡️",
      subtitle: "Chuyên Gia An Ninh Mạng & Hacker Mũ Trắng",
      desc: "Bạn có tư duy phản biện sắc bén, luôn tò mò về lỗ hổng hệ thống và bảo vệ dữ liệu trước mọi cuộc tấn công mạng.",
      skills: ["Network & Protocols", "Penetration Testing", "Cryptography", "Linux & Shell", "Security Auditing"],
      advice: "Tham gia các giải đấu CTF, nghiên cứu mã độc, kiểm thử bảo mật web (OWASP Top 10) và học chứng chỉ CEH/CompTIA."
    },
    product: {
      name: "PRODUCT OWNER & TECH LEAD",
      icon: "🚀",
      subtitle: "Quản Lý Sản Phẩm & Định Hướng Chiến Lược",
      desc: "Bạn có tầm nhìn bao quát, thích kết nối con người với công nghệ và tối ưu hóa giá trị sản phẩm cho khách hàng.",
      skills: ["Business Analysis", "Agile / Scrum", "Product Strategy", "User Journey Mapping", "Tech Architecture"],
      advice: "Rèn luyện tư duy sản phẩm (Product Thinking), kỹ năng giao tiếp dẫn dắt team và phân tích số liệu người dùng."
    },
    uiux: {
      name: "UI/UX & CREATIVE DESIGNER",
      icon: "🎨",
      subtitle: "Nhà Thiết Kế Trải Nghiệm & Giao Diện Số",
      desc: "Bạn nhạy bén về thẩm mỹ thị giác, thấu hiểu tâm lý hành vi người dùng và luôn tạo ra những trải nghiệm số say đắm.",
      skills: ["Figma / UI Design", "User Research", "Design Systems", "Prototyping & Motion", "Frontend Basics"],
      advice: "Xây dựng portfolio thiết kế ấn tượng trên Figma, nghiên cứu tâm lý học trải nghiệm (HCI) và làm việc chặt chẽ với Dev."
    }
  },
  gameDev: {
    gameplay: {
      name: "GAMEPLAY PROGRAMMER",
      icon: "🕹️",
      subtitle: "Lập Trình Viên Logic & Cơ Chế Trò Chơi",
      desc: "Bạn là linh hồn của trò chơi! Bạn biến các ý tưởng điều khiển, combat, combo chiêu thức và hành vi quái vật thành hiện thực mượt mà.",
      skills: ["C# / C++", "Unity / Unreal Engine", "State Machines / AI Game", "Physics & Collision", "Animation Rigging"],
      advice: "Tập trung xây dựng hệ thống điều khiển nhân vật 'Game Feel' đỉnh cao và tối ưu hóa frame rate 60-120 FPS."
    },
    gameArtist: {
      name: "GAME ARTIST & VFX WIZARD",
      icon: "🎨",
      subtitle: "Họa Sĩ Đồ Họa 3D, Hiệu Ứng & Shader",
      desc: "Bạn tạo nên vẻ đẹp thị giác cho thế giới game với mô hình 3D sống động, ánh sáng ma mị, hiệu ứng phép thuật cháy nổ mãn nhãn.",
      skills: ["Blender / Maya / 3ds Max", "Shader Graph / HLSL", "Substance Painter", "Niagara VFX", "Concept Art"],
      advice: "Thực hành làm Shader đồ họa, làm chủ quy trình dựng model PBR và tối ưu số lượng đa giác (Poly count) cho game."
    },
    gameDesigner: {
      name: "GAME & LEVEL DESIGNER",
      icon: "📜",
      subtitle: "Kiến Trúc Sư Thế Giới Game & Cốt Truyện",
      desc: "Bạn là người định hình luật chơi, thiết kế bản đồ thử thách, cốt truyện lôi cuốn và cân bằng kinh tế trong game.",
      skills: ["Game Mechanics Design", "Level Architecture", "Game Economy & Balancing", "Storytelling", "Player Psychology"],
      advice: "Viết Game Design Document (GDD) chi tiết, phân tích các tựa game AAA/Indie nổi tiếng và thử nghiệm liên tục với playtesters."
    },
    engineDev: {
      name: "GAME ENGINE & CORE ARCHITECT",
      icon: "⚙️",
      subtitle: "Kỹ Sư Engine & Đồ Họa Hiệu Năng Cao",
      desc: "Bạn thích đào sâu vào cốt lõi: tối ưu hóa bộ nhớ, dựng hình đa luồng (Multi-threading), viết engine riêng và rendering pipeline.",
      skills: ["C++ / Rust", "Vulkan / DirectX / OpenGL", "Memory Management", "Multithreading", "Spatial Partitioning"],
      advice: "Đọc sách Game Engine Architecture, tự viết một 2D/3D Renderer từ đầu và làm chủ lập trình cấp thấp (Low-level)."
    },
    gameQA: {
      name: "GAME TESTER & BALANCE MASTER",
      icon: "🎯",
      subtitle: "Chuyên Gia Kiểm Thử Game & Cân Bằng Trải Nghiệm",
      desc: "Bạn có đôi mắt thần săn lùng mọi lỗi glitch kẹt map, bug đúp đồ và đảm bảo game cân bằng hoàn hảo trước ngày ra mắt.",
      skills: ["Playtesting & Exploits Hunt", "Bug Tracking (Jira)", "Automation Test Scripting", "Combat Balancing", "Telemetry Analysis"],
      advice: "Rèn luyện khả năng tái hiện bug khó, hiểu rõ meta game và đóng góp ý kiến giúp cải thiện trải nghiệm game thủ."
    }
  },
  aiFuture: {
    llmPrompt: {
      name: "GENAI & AI AGENT ARCHITECT",
      icon: "🧠",
      subtitle: "Kỹ Sư AI Thế Hệ Mới & Hệ Thống Tự Động Hóa",
      desc: "Bạn là bậc thầy điều khiển các mô hình ngôn ngữ lớn (LLM), xây dựng Multi-Agent tự hành, RAG và biến ý tưởng thành siêu ứng dụng.",
      skills: ["LangChain / LlamaIndex", "Prompt Engineering", "Vector Databases (Pinecone/Chroma)", "Function Calling & Tools", "Python"],
      advice: "Xây dựng các Agent giải quyết bài toán thực tiễn của doanh nghiệp và nắm vững kỹ thuật Fine-tuning & RAG nâng cao."
    },
    mlEngineer: {
      name: "DEEP LEARNING & ML SCIENTIST",
      icon: "🔬",
      subtitle: "Nhà Khoa Học Học Sâu & Thuật Toán Mô Hình",
      desc: "Bạn đam mê cấu trúc mạng nơ-ron, hàm mất mát (loss function), toán đại số tuyến tính và huấn luyện các mô hình tiên tiến.",
      skills: ["PyTorch / TensorFlow", "Transformers Architecture", "CUDA & GPU Optimization", "Mathematics & Statistics", "Model Training"],
      advice: "Đọc các paper nghiên cứu mới trên arXiv, tham gia các cuộc thi Kaggle và tự xây dựng kiến trúc mạng neural tùy biến."
    },
    dataScientist: {
      name: "BIG DATA & DATA STRATEGIST",
      icon: "📊",
      subtitle: "Chuyên Gia Dữ Liệu Lớn & Phân Tích Chiến Lược",
      desc: "Dữ liệu là dầu mỏ mới, và bạn là nhà tinh chế xuất sắc! Bạn tìm ra những quy luật ẩn và dự báo tương lai từ hàng tỷ dòng dữ liệu.",
      skills: ["SQL & BigQuery", "Pandas / Polars / Spark", "Data Visualization (Tableau/PowerBI)", "Predictive Modeling", "A/B Testing"],
      advice: "Thực hành phân tích các bộ dữ liệu lớn thực tế, rèn luyện kỹ năng Data Storytelling để thuyết phục người nghe."
    },
    computerVision: {
      name: "COMPUTER VISION & ROBOTICS",
      icon: "👁️",
      subtitle: "Kỹ Sư Thị Giác Máy Tính & Robot Thông Minh",
      desc: "Bạn mang lại đôi mắt cho cỗ máy: nhận diện khuôn mặt, phát hiện vật thể y tế, xe tự hành và mô hình hóa không gian 3D.",
      skills: ["OpenCV", "YOLO / Segment Anything", "3D Computer Vision / NeRF", "Robotics (ROS)", "Edge AI Deployment"],
      advice: "Triển khai các mô hình thị giác máy tính trên thiết bị nhúng (Raspberry Pi, Jetson Nano) và tối ưu độ trễ xử lý thời gian thực."
    },
    mlOps: {
      name: "MLOPS & AI INFRASTRUCTURE",
      icon: "⚡",
      subtitle: "Kỹ Sư Vận Hành & Hạ Tầng Mô Hình AI",
      desc: "Bạn là cầu nối đưa mô hình từ notebook nghiên cứu lên môi trường sản xuất quy mô lớn với độ trễ thấp và độ tin cậy tuyệt đối.",
      skills: ["Docker & Kubernetes", "MLflow / Kubeflow", "Triton Inference Server", "CI/CD for ML", "Cloud GPUs (AWS/GCP)"],
      advice: "Xây dựng pipeline huấn luyện và triển khai tự động (Continuous Training & Deployment) cho các mô hình AI lớn."
    }
  },
  webDev: {
    frontend: {
      name: "FRONTEND MASTER",
      icon: "🎨",
      subtitle: "Kiến Trúc Sư Giao Diện Web & Tương Tác Hiện Đại",
      desc: "Bạn tạo ra những trải nghiệm web lung linh, phản hồi tức thì với tốc độ 60fps và hiệu ứng mượt mà như ứng dụng native.",
      skills: ["React / Next.js / Vue", "TypeScript", "Tailwind CSS / CSS Animation", "Web Vitals & Performance", "PWA"],
      advice: "Nắm vững JavaScript chuyên sâu, làm chủ server-side rendering (SSR) và tối ưu hóa Core Web Vitals của Google."
    },
    backend: {
      name: "BACKEND & DISTRIBUTED SYSTEMS",
      icon: "⚙️",
      subtitle: "Kỹ Sư Hệ Thống Máy Chủ & API Hiệu Năng Cao",
      desc: "Bạn điều phối dòng chảy dữ liệu ngầm, thiết kế cơ sở dữ liệu chịu tải hàng triệu truy vấn và bảo mật API an toàn tuyệt đối.",
      skills: ["Node.js / Go / Java", "PostgreSQL / MongoDB / Redis", "gRPC / REST / GraphQL", "Microservices", "Message Queue (Kafka)"],
      advice: "Luyện tập thiết kế hệ thống (System Design), quản lý transaction cơ sở dữ liệu và tối ưu hóa index truy vấn."
    },
    devops: {
      name: "DEVOPS & CLOUD ARCHITECT",
      icon: "☁️",
      subtitle: "Kỹ Sư Tự Động Hóa Triển Khai & Đám Mây",
      desc: "Bạn đảm bảo hệ thống luôn sẵn sàng 99.99%, tự động hóa mọi khâu release và bảo vệ hạ tầng đám mây an toàn vững chãi.",
      skills: ["Docker / Kubernetes", "CI/CD (GitHub Actions)", "Terraform / IaC", "AWS / GCP / Azure", "Prometheus / Grafana"],
      advice: "Tự động hóa mọi tác vụ lặp lại, học về Container Orchestration và kiến trúc bất biến (Immutable Infrastructure)."
    },
    fullstack: {
      name: "FULLSTACK NINJA",
      icon: "⚡",
      subtitle: "Kỹ Sư Toàn Năng Từ Giao Diện Đến Máy Chủ",
      desc: "Bạn là chiến binh độc lập có thể tự mình xây dựng trọn vẹn một sản phẩm khởi nghiệp từ ý tưởng đến khi ra mắt thị trường.",
      skills: ["Fullstack Frameworks", "End-to-End Architecture", "Database Modeling", "API Integration", "Rapid Prototyping"],
      advice: "Tự xây dựng các dự án SaaS cá nhân hoàn chỉnh, rèn luyện tốc độ hoàn thiện tính năng (Time-to-market)."
    },
    uiuxWeb: {
      name: "WEB UX & PRODUCT DESIGNER",
      icon: "👁️",
      subtitle: "Chuyên Gia Trải Nghiệm Người Dùng Web",
      desc: "Bạn đảm bảo người dùng có hành trình mượt mà nhất trên trang web, tăng tỷ lệ chuyển đổi và nâng tầm thương hiệu.",
      skills: ["Figma & Design System", "User Journey & Usability Test", "A/B Testing", "Accessibility (a11y)", "Conversion Optimization"],
      advice: "Kết hợp thẩm mỹ với tâm lý học hành vi người dùng và đo lường hiệu quả thiết kế bằng các chỉ số chuyển đổi thực tế."
    }
  }
};

async function renderResult() {
  const currentTrack = data.track || "itGeneral";
  let universesMeta = defaultUniversesMeta;

  try {
    const res = await fetch(`${API}/tracks`);
    if (res.ok) {
      const info = await res.json();
      if (info.universesMeta) universesMeta = info.universesMeta;
    }
  } catch (e) {
    // Keep default metadata
  }

  const trackMeta = universesMeta[currentTrack] || universesMeta.itGeneral;
  const primaryKey = data.primaryUniverse || Object.keys(trackMeta)[0];
  const m = trackMeta[primaryKey] || {
    name: "TECH EXPLORER",
    icon: "🌟",
    subtitle: "Nhà Khám Phá Công Nghệ",
    desc: "Bạn có tiềm năng đa dạng và khả năng thích ứng linh hoạt trong thế giới công nghệ hiện đại.",
    skills: ["Problem Solving", "Critical Thinking", "Fast Learning", "Teamwork"],
    advice: "Hãy thử sức với các dự án thực tế để sớm tìm ra lĩnh vực mà bạn đam mê nhất."
  };

  // Set user and track badge
  document.getElementById("trackBadge").textContent = trackNames[currentTrack] || "KẾT QUẢ ĐỊNH HƯỚNG";
  document.getElementById("userGreeting").innerHTML = `Khám phá viên: <b>${escapeHtml(data.playerName || "Bạn")}</b>`;

  // Set dominant universe info
  document.getElementById("icon").textContent = m.icon;
  document.getElementById("universe").textContent = m.name;
  document.getElementById("subtitle").textContent = m.subtitle || "";
  document.getElementById("description").textContent = m.desc;

  // Set skills pills
  const skillsList = document.getElementById("skillsList");
  if (skillsList) {
    skillsList.innerHTML = "";
    (m.skills || ["Kỹ năng chuyên sâu", "Công nghệ mũi nhọn"]).forEach(sk => {
      const span = document.createElement("span");
      span.className = "skill-pill";
      span.textContent = sk;
      skillsList.appendChild(span);
    });
  }

  // Set advice
  const adviceEl = document.getElementById("adviceText");
  if (adviceEl) adviceEl.textContent = m.advice || "Tiếp tục học hỏi, thực hành qua các dự án thực tế.";

  // Score breakdown
  const rawScores = data.scores || {};
  const total = Object.values(rawScores).reduce((a, b) => a + b, 0) || 1;
  const list = document.getElementById("scoreList");
  list.innerHTML = "";

  Object.entries(rawScores)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => {
      const uInfo = trackMeta[k] || { name: k.toUpperCase(), icon: "✦" };
      const pct = Math.round((v / total) * 100);
      list.insertAdjacentHTML(
        "beforeend",
        `<div class="score-row">
          <div class="score-head">
            <span>${uInfo.icon} <b>${uInfo.name}</b></span>
            <b>${pct}% (${v} điểm)</b>
          </div>
          <div class="mini-bar"><i style="width:${pct}%"></i></div>
        </div>`
      );
    });
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

renderResult();