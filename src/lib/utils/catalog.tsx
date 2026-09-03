import React from "react";
import VideoCameraFrontOutlinedIcon from "@mui/icons-material/VideoCameraFrontOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";

export const CATALOG_TYPE_OPTIONS = [
  { value: "live_session", label: "Live Session", description: "Bimbingan tatap muka online via video call" },
  { value: "recorded_course", label: "Video Belajar", description: "Materi video rekaman fleksibel yang dapat diakses kapan saja" },
  { value: "document_material", label: "Materi Dokumen", description: "Modul, eBook, template atau dokumen panduan terstruktur" },
  { value: "chat_consultation", label: "Konsultasi Chat", description: "Tanya jawab langsung dan konsultasi intensif via chat" },
] as const;

export const CATALOG_STATUS_TABS = [
  { id: "all", label: "Semua" },
  { id: "published", label: "Aktif" },
  { id: "pending_review", label: "Menunggu Review" },
  { id: "draft", label: "Draft" },
  { id: "rejected", label: "Ditolak" },
] as const;

export function getCatalogTypeLabel(type: string): string {
  switch (type) {
    case "live_session":
      return "Live Session";
    case "recorded_course":
    case "course":
      return "Video Belajar";
    case "document_material":
      return "Materi Dokumen";
    case "chat_consultation":
      return "Konsultasi Chat";
    case "mentoring":
      return "Mentoring";
    default:
      return type || "Layanan";
  }
}

export function getCatalogTypeIcon(type: string, className = ""): React.ReactNode {
  switch (type) {
    case "live_session":
      return <VideoCameraFrontOutlinedIcon sx={{ fontSize: 16 }} className={`text-primary ${className}`} />;
    case "recorded_course":
    case "course":
      return <PlayCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} className={`text-secondary ${className}`} />;
    case "document_material":
      return <DescriptionOutlinedIcon sx={{ fontSize: 16 }} className={`text-warning ${className}`} />;
    case "chat_consultation":
      return <ChatOutlinedIcon sx={{ fontSize: 16 }} className={`text-success ${className}`} />;
    default:
      return <LayersOutlinedIcon sx={{ fontSize: 16 }} className={className} />;
  }
}

export function getCatalogStatusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case "published":
    case "active":
      return "Aktif";
    case "pending_review":
      return "Menunggu Review";
    case "draft":
      return "Draft";
    case "rejected":
      return "Ditolak";
    case "archived":
      return "Diarsipkan";
    default:
      return status || "Draft";
  }
}
