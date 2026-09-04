import Link from "next/link";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import { EmptyState } from "./EmptyState";

interface ComingSoonStateProps {
  feature: string;
}

export function ComingSoonState({ feature }: ComingSoonStateProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={<ConstructionOutlinedIcon sx={{ fontSize: 48 }} />}
        title={`${feature} belum tersedia`}
        description="Halaman ini sedang dipersiapkan dan belum dapat digunakan. Silakan kembali ke dashboard untuk melanjutkan aktivitas lain."
        action={
          <Link
            href="/"
            className="inline-flex items-center rounded-[10px] bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-primary/90"
          >
            Kembali ke Beranda
          </Link>
        }
      />
    </div>
  );
}
