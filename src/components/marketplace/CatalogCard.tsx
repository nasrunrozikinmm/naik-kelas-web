"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import StarIcon from "@mui/icons-material/Star";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Box, Button, Card, CardActions, CardContent, Chip, Stack, Typography, Avatar } from "@mui/material";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import type { CatalogCardModel } from "@/types/domain";
import { formatCurrency } from "@/lib/utils/format";

export function CatalogCard({ catalog }: Readonly<{ catalog: CatalogCardModel }>) {
  const dispatch = useAppDispatch();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addItem({
        item: { id: catalog.id, title: catalog.title, price: catalog.price, qty: 1 }
      })
    );
  }

  const defaultImage = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=640";
  const typeLabel =
    catalog.type === "mentoring"
      ? "Mentoring"
      : catalog.type === "course"
      ? "Video Course"
      : catalog.type === "live_session"
      ? "Live Session"
      : catalog.type || "Program";

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          transform: "translateY(-2px)"
        }
      }}
    >
      <Box sx={{ position: "relative", height: 190, width: "100%", bgcolor: "grey.100" }}>
        <Image
          src={catalog.image || defaultImage}
          alt={catalog.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <Box sx={{ position: "absolute", top: 12, left: 12 }}>
          <Chip
            label={typeLabel}
            size="small"
            color="primary"
            sx={{
              fontWeight: 700,
              fontSize: "0.75rem",
              backdropFilter: "blur(4px)",
              bgcolor: "rgba(0, 63, 177, 0.85)"
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Chip
              label={catalog.category || "Umum"}
              size="small"
              variant="outlined"
              color="secondary"
              sx={{ borderRadius: 1.5, fontSize: "0.7rem", height: 24 }}
            />
            <Stack direction="row" spacing={0.5} alignItems="center">
              <StarIcon sx={{ color: "#f59e0b", fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                {(catalog.rating || 4.9).toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({catalog.reviewsCount || 0})
              </Typography>
            </Stack>
          </Box>

          <Typography
            component="h3"
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.6em"
            }}
          >
            {catalog.title}
          </Typography>

          {/* Talent / Mentor Info Block */}
          <Box
            component={Link}
            href={`/profile/${catalog.talent_profile_id || catalog.id}`}
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              textDecoration: "none",
              color: "inherit",
              p: 0.75,
              mx: -0.75,
              borderRadius: 2,
              transition: "all 0.15s ease",
              "&:hover": {
                bgcolor: "action.hover",
                "& .talent-name": {
                  color: "primary.main"
                }
              }
            }}
          >
            <Avatar
              src={catalog.talentAvatar}
              alt={catalog.talentName}
              sx={{
                width: 34,
                height: 34,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: "0.8125rem",
                fontWeight: 700,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
              }}
            >
              {catalog.talentName?.[0] || "M"}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography
                  className="talent-name"
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                    lineHeight: 1.25,
                    color: "text.primary",
                    transition: "color 0.15s ease",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {catalog.talentName || "Mentor Naik Kelas"}
                </Typography>
                {catalog.isVerified !== false && (
                  <VerifiedIcon sx={{ fontSize: 15, color: "#003fb1", flexShrink: 0 }} />
                )}
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  fontSize: "0.72rem",
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {catalog.talentTitle || catalog.institution || catalog.mentorTitle || "Mentor Terverifikasi"}
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: "0.8rem",
              minHeight: "2.4em"
            }}
          >
            {catalog.description || catalog.excerpt || "Bimbingan terstruktur dan kurikulum mendalam untuk impian akademismu."}
          </Typography>

          <Box sx={{ pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Mulai dari
            </Typography>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
              {formatCurrency(catalog.price)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button
          startIcon={<VisibilityIcon sx={{ fontSize: 18 }} />}
          variant="outlined"
          size="small"
          fullWidth
          component={Link}
          href={`/catalog/${catalog.id}`}
          sx={{ borderRadius: 2 }}
        >
          Detail
        </Button>
        <Button
          startIcon={<AddShoppingCartIcon sx={{ fontSize: 18 }} />}
          variant="contained"
          size="small"
          fullWidth
          onClick={handleAddToCart}
          sx={{ borderRadius: 2 }}
        >
          Cart
        </Button>
      </CardActions>
    </Card>
  );
}

