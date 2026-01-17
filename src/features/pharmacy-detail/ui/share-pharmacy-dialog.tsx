"use client";

import { cn } from "@/shared/lib/hooks/utils";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { MessengerIcon, ViberIcon, WhatsAppIcon } from "@/shared/ui/icons";
import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SharePharmacyDialogProps {
  pharmacyName: string;
  pharmacyAddress: string;
}

export function SharePharmacyDialog({
  pharmacyName,
  pharmacyAddress,
}: SharePharmacyDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `Φαρμακείο ${pharmacyName} - ${pharmacyAddress}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Ο σύνδεσμος αντιγράφηκε!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying to clipboard:", err);
      toast.error("Αποτυχία αντιγραφής");
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      url: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      className:
        "text-[#128C7E] border-[#128C7E]/20 hover:bg-[#128C7E]/10 hover:text-[#128C7E]",
    },
    {
      name: "Viber",
      icon: ViberIcon,
      url: `viber://forward?text=${encodeURIComponent(text + " " + url)}`,
      className:
        "text-[#7360f2] border-[#7360f2]/20 hover:bg-[#7360f2]/10 hover:text-[#7360f2]",
    },
    {
      name: "Messenger",
      icon: MessengerIcon,
      url: `fb-messenger://share/?link=${encodeURIComponent(url)}`,
      className:
        "text-[#1877F2] border-[#1877F2]/20 hover:bg-[#1877F2]/10 hover:text-[#1877F2]",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-muted/50"
        >
          <Share2 className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Κοινοποίηση</DialogTitle>
          <DialogDescription>
            Μοιραστείτε το φαρμακείο {pharmacyName} με τους φίλους σας.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center gap-2 h-12 text-base"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="size-5" />
              ) : (
                <Copy className="size-5" />
              )}
              {copied ? "Αντιγράφηκε" : "Αντιγραφή Συνδέσμου"}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {shareLinks.map((link) => (
              <Button
                key={link.name}
                variant="outline"
                className={cn(
                  "flex flex-col items-center justify-center gap-2 h-24 p-2",
                  link.className
                )}
                asChild
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <link.icon className="size-8" />
                  <span className="text-xs font-medium">{link.name}</span>
                </a>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
