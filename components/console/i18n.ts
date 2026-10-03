import type { Locale, View } from "./types";

const messages = {
  vi: {
    nav: {
      dashboard: "Tổng quan",
      experiments: "Thí nghiệm",
      matrix: "Ma trận robustness",
      compare: "Failure cases",
      triage: "Triage",
      reports: "Báo cáo",
      registry: "Model registry",
      gpu: "Tài nguyên GPU",
      settings: "Cấu hình",
      systemHub: "Hệ thống & GPU",
    },
    titles: {
      dashboard: ["Trung tâm kiểm thử", "ROBUSTNESS OPERATIONS"],
      experiments: ["Thiết kế thí nghiệm", "EXPERIMENT CONTROL"],
      monitor: ["Theo dõi phiên chạy", "LIVE EXECUTION"],
      compare: ["So sánh failure case", "SAMPLE INSPECTION"],
      matrix: ["Ma trận robustness", "BENCHMARK ANALYSIS"],
      triage: ["Hàng đợi triage", "SAFETY REVIEW"],
      reports: ["Báo cáo & sign-off", "ASSURANCE GATE"],
      admin: ["Tài nguyên hệ thống", "ADMIN CONTROL"],
    },
    search: "Tìm run, model, failure case...",
    demo: "Dữ liệu mẫu",
    create: "Tạo thí nghiệm",
    controlPlane: "ĐIỀU HÀNH",
    system: "HỆ THỐNG",
    stable: "GPU cluster ổn định",
    workers: "3/4 worker online · hàng đợi 2 run",
    resources: "Xem tài nguyên",
    gpuMonth: "GPU tháng 09",
    readOnly: "CHỈ ĐỌC",
    builder: "Xem builder",
  },
  en: {
    nav: {
      dashboard: "Overview",
      experiments: "Experiments",
      matrix: "Robustness matrix",
      compare: "Failure cases",
      triage: "Triage",
      reports: "Reports",
      registry: "Model registry",
      gpu: "GPU resources",
      settings: "Settings",
      systemHub: "System & GPU",
    },
    titles: {
      dashboard: ["Test center", "ROBUSTNESS OPERATIONS"],
      experiments: ["Experiment builder", "EXPERIMENT CONTROL"],
      monitor: ["Run monitor", "LIVE EXECUTION"],
      compare: ["Failure case comparison", "SAMPLE INSPECTION"],
      matrix: ["Robustness matrix", "BENCHMARK ANALYSIS"],
      triage: ["Triage queue", "SAFETY REVIEW"],
      reports: ["Reports & sign-off", "ASSURANCE GATE"],
      admin: ["System resources", "ADMIN CONTROL"],
    },
    search: "Search runs, models, failure cases...",
    demo: "Demo data",
    create: "New experiment",
    controlPlane: "CONTROL PLANE",
    system: "SYSTEM",
    stable: "GPU cluster healthy",
    workers: "3/4 workers online · 2 runs queued",
    resources: "View resources",
    gpuMonth: "September GPU",
    readOnly: "READ ONLY",
    builder: "Open builder",
  },
} as const;

export function getConsoleCopy(locale: Locale) {
  return messages[locale];
}

export function getViewTitle(locale: Locale, view: View): readonly [string, string] {
  return messages[locale].titles[view];
}
