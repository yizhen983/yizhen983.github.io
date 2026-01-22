import { ExternalLink } from "lucide-react";
import { references } from "@/data/content";

const ReferencesSection = () => {
  return (
    <section className="mt-16 py-8 border-t border-border">
      <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
        參考文獻 References
      </h2>
      <div className="space-y-4">
        {references.map((ref) => (
          <div key={ref.id} className="text-sm text-muted-foreground leading-relaxed">
            <p>
              {ref.author}. ({ref.year}).{" "}
              <span className="italic">{ref.title}</span>.
              {ref.source && ` ${ref.source}.`}{" "}
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-secondary hover:underline"
              >
                {ref.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReferencesSection;
