"use client";

import { Button } from "@mui/material";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { useRouter } from "next/navigation";
import type { CatalogCardModel } from "@/types/domain";

export function AddToCartButton({ catalog }: { catalog: CatalogCardModel }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  function handle() {
    dispatch(
      addItem({
        item: {
          id: catalog.id,
          title: catalog.title,
          price: catalog.price,
          qty: 1,
          type: catalog.type,
          image: catalog.image,
          talentName: catalog.talentName,
        },
      })
    );
    router.push("/cart");
  }

  return (
    <Button variant="contained" color="primary" fullWidth onClick={handle}>
      Beli Paket Sekarang
    </Button>
  );
}
