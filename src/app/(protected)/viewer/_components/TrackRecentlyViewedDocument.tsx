"use client";

import { useEffect } from "react";
import { saveRecentlyViewedDocument } from "@/lib/viewer/recentlyViewed";

type TrackRecentlyViewedDocumentProps = {
  viewerPath: string;
  title: string;
};

export function TrackRecentlyViewedDocument({
  viewerPath,
  title,
}: TrackRecentlyViewedDocumentProps) {
  useEffect(() => {
    saveRecentlyViewedDocument({
      viewerPath,
      title,
      viewedAt: new Date().toISOString(),
    });
  }, [title, viewerPath]);

  return null;
}
