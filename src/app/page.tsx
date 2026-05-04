import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Map, FileSearch, Database } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/40">
      <header className="h-14 px-6 flex items-center justify-between border-b border-border bg-card/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <span className="font-semibold">CME — DGID Tracker</span>
        </div>
        <div className="flex items-center gap-2">
          {session ? (
            <Link href="/dashboard">
              <Button size="sm">
                Tableau de bord <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm">Se connecter</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 px-6 py-16 max-w-6xl w-full mx-auto">
        <section className="text-center space-y-5 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-medium tracking-wide uppercase px-3 py-1 rounded-full bg-primary/10 text-primary">
            Centre des Moyennes Entreprises
          </span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Suivi consolidé des entités immobilières au Sénégal
          </h1>
          <p className="text-muted-foreground text-lg">
            Croisement des données CME, ANSD, SIGTAS, SVLMOD et sources web pour identifier les
            incohérences fiscales, les contribuables potentiels et cartographier le patrimoine.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href={session ? "/dashboard" : "/login"}>
              <Button size="lg">
                {session ? "Accéder au tableau de bord" : "Commencer"}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/map">
              <Button size="lg" variant="outline">
                <Map className="mr-2 h-4 w-4" />
                Voir la carte
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
          <FeatureCard
            icon={Building2}
            title="Entités consolidées"
            description="SCI, promoteurs, agences et constructeurs centralisés à partir des registres CME et ANSD."
          />
          <FeatureCard
            icon={FileSearch}
            title="Analyse croisée"
            description="Détection automatique des entités présentes dans une source mais absentes d'une autre."
          />
          <FeatureCard
            icon={Map}
            title="Cartographie cadastrale"
            description="794 000 parcelles géolocalisées avec rapprochement aux entités fiscales."
          />
        </section>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} CME — DGID. Tous droits réservés.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
