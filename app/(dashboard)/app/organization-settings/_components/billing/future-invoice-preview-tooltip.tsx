import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FutureInvoicePreviewTooltip: React.FC = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className="h-[18px]">
        <Button
          variant={"ghost"}
          size={"icon-sm"}
          className="p-0 w-4 !rounded-xl min-h-none h-auto "
        >
          <Info />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm">
        This is a preview. Stripe will apply discounts, coupons, and any
        customer balance when the invoice is generated. Final amount may differ.
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
