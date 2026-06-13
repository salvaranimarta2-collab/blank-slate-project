import { useEffect } from "react";
import { toast } from "sonner";
import { Heart, HandCoins, MessageCircle, Users, Sparkles, Globe2, FileText, CheckCircle2 } from "lucide-react";

const NOTIFICATIONS: Array<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  { title: "New donor interested", description: "Open Society Foundations viewed your initiative in Athens.", icon: <HandCoins className="h-4 w-4 text-emerald-600" /> },
  { title: "Message received", description: "Refugee Women's Centre replied to your outreach.", icon: <MessageCircle className="h-4 w-4 text-blue-600" /> },
  { title: "Partnership request", description: "Choose Love wants to connect about your Lesvos project.", icon: <Users className="h-4 w-4 text-purple-600" /> },
  { title: "Funding milestone", description: "Hands Up Foundation just funded €4,200 to a partner RLO.", icon: <Heart className="h-4 w-4 text-rose-600" /> },
  { title: "New initiative nearby", description: "Solidarity Now posted a new project in Thessaloniki.", icon: <Sparkles className="h-4 w-4 text-amber-600" /> },
  { title: "Profile viewed", description: "IKEA Foundation viewed your organisation profile.", icon: <Globe2 className="h-4 w-4 text-teal-600" /> },
  { title: "Report shared", description: "Khora Community Centre shared their quarterly impact report.", icon: <FileText className="h-4 w-4 text-indigo-600" /> },
  { title: "Donation confirmed", description: "€250 monthly contribution from a new supporter.", icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" /> },
  { title: "New donor joined", description: "ELMA Philanthropies just joined Waythrough.", icon: <Sparkles className="h-4 w-4 text-amber-600" /> },
  { title: "Match found", description: "Your initiative matches 3 active funders' criteria.", icon: <HandCoins className="h-4 w-4 text-emerald-600" /> },
];

export function DemoNotifier() {
  useEffect(() => {
    let i = Math.floor(Math.random() * NOTIFICATIONS.length);
    const interval = setInterval(() => {
      const n = NOTIFICATIONS[i % NOTIFICATIONS.length];
      i++;
      toast(n.title, { description: n.description, icon: n.icon, duration: 5000 });
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
