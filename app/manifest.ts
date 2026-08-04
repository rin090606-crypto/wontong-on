import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/?app=wontong-on-v2",
    name: "원통ON",
    short_name: "원통ON",
    description: "원통고등학교 학생들을 위한 학교생활 플랫폼",
    start_url: "/?app=wontong-on-v2",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    orientation: "portrait",
    lang: "ko-KR",
    icons: [
      {
        src: "/wontong-on-icon-192-v2.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/wontong-on-icon-512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
