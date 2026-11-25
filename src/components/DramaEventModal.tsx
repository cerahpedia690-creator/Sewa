import { PortraitCanvas } from './PortraitCanvas';
import { DramaEvent, Tenant } from '../game/types';

interface DramaEventModalProps {
  event: DramaEvent;
  tenants: Tenant[];
  onChoose: (choiceId: string) => void;
}

export function DramaEventModal({ event, tenants, onChoose }: DramaEventModalProps) {
  const primary = tenants.find((t) => t.id === event.primaryTenantId);
  const secondary = event.secondaryTenantId
    ? tenants.find((t) => t.id === event.secondaryTenantId)
    : undefined;

  const categoryLabels: Record<DramaEvent['category'], string> = {
    CONFLICT: 'Conflict Event',
    RELATIONSHIP: 'Relationship Event',
    RANDOM: 'Random Event',
    STORY: 'Story Event',
    BUSINESS: 'Business Event',
    EMERGENCY: 'Emergency Event',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="pixel-panel w-full max-w-xl p-5 text-stone-100">
        <div className="mb-3 flex items-center justify-between text-xs text-amber-400">
          <span>{categoryLabels[event.category]}</span>
          <span className="font-mono-num text-stone-400">Day {event.triggeredDay}</span>
        </div>

        <h2 className="font-pixel text-lg text-amber-100">{event.title}</h2>

        <div className="my-4 flex items-start gap-3 bg-stone-950/70 p-3 border border-stone-700">
          <div className="flex shrink-0 gap-2">
            {primary && <PortraitCanvas tenant={primary} size={56} />}
            {secondary && <PortraitCanvas tenant={secondary} size={56} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 text-xs font-semibold text-amber-300">
              {primary?.name}
              {secondary ? ` & ${secondary.name}` : ''}
            </div>
            <p className="text-sm leading-relaxed text-stone-200">{event.dialogue}</p>
          </div>
        </div>

        <div className="space-y-2">
          {event.choices.map((ch) => (
            <button
              key={ch.id}
              onClick={() => onChoose(ch.id)}
              className="pixel-btn flex w-full flex-col items-start bg-stone-800 px-4 py-2.5 text-left hover:bg-stone-700 cursor-pointer"
            >
              <span className="text-sm font-semibold text-amber-100">{ch.label}</span>
              <span className="text-xs text-stone-400">{ch.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
