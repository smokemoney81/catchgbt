import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Premium() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(createPageUrl('PremiumPlans'), { replace: true });
  }, []);

  return null;
}