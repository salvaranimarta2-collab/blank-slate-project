import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin } from "lucide-react";
import { categoryPhotos } from "@/lib/category-photos";
import type { Category } from "@/lib/fieldmap-data";
import type { AnonymousSms } from "@/lib/load-anonymous-sms";

export function SmsViewDialog({
  sms,
  open,
  onOpenChange,
}: {
  sms: AnonymousSms | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!sms) return null;

  const photo = categoryPhotos[sms.category as Category];
  const funding = (sms.needs as { funding?: { currency?: string; amount?: number; raised?: number } } | null)
    ?.funding;
  const needs = (sms.needs as {
    expertise?: string[];
    equipment?: string;
    training?: string;
    partnership?: boolean;
  } | null) ?? {};
  const fundingPct = funding?.amount
    ? Math.min(100, Math.round(((funding.raised ?? 0) / funding.amount) * 100))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <Card className="overflow-hidden border-0 p-0 shadow-none">
          {photo && (
            <div className="relative h-40 w-full bg-muted">
              <img
                src={photo}
                alt={`${sms.category} initiative`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
              <Badge variant="secondary" className="absolute left-2 top-2 capitalize">
                {sms.category}
              </Badge>
              <Badge
                variant="outline"
                className="absolute right-2 top-2 bg-background/90 text-[10px] uppercase"
              >
                SMS
              </Badge>
              <div className="absolute inset-x-3 bottom-2">
                <p className="line-clamp-2 text-base font-semibold leading-snug text-white">
                  {sms.title}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">Location withheld</span>
            </div>

            {sms.description && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {sms.description}
              </p>
            )}

            {funding?.amount ? (
              <div className="space-y-1 rounded-md border border-[hsl(152_65%_36%)]/30 bg-[hsl(152_65%_36%)]/5 p-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold uppercase tracking-wide text-muted-foreground">
                    Funding
                  </span>
                  <span className="font-medium">{fundingPct}% raised</span>
                </div>
                <Progress
                  value={fundingPct}
                  className="h-1.5 [&>div]:bg-[hsl(152_65%_36%)]"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {funding.currency} {(funding.raised ?? 0).toLocaleString()} raised
                  </span>
                  <span>
                    of {funding.currency} {funding.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-1">
              {needs.expertise?.map((e) => (
                <Badge key={e} variant="secondary" className="capitalize text-[10px]">
                  {e}
                </Badge>
              ))}
              {needs.equipment && (
                <Badge variant="secondary" className="text-[10px]">Equipment</Badge>
              )}
              {needs.training && (
                <Badge variant="secondary" className="text-[10px]">Training</Badge>
              )}
              {needs.partnership && (
                <Badge variant="secondary" className="text-[10px]">Partnership</Badge>
              )}
            </div>

            {sms.beneficiaries && (
              <div className="border-t pt-2 text-[11px] capitalize text-muted-foreground">
                {sms.beneficiaries} beneficiaries
              </div>
            )}
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
