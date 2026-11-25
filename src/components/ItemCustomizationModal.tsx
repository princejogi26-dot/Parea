import {Minus, Plus, X} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {MenuItem, SelectedOption, Vendor} from '../types/delivery';

interface ItemCustomizationModalProps {
  vendor: Vendor;
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    selectedOptions: SelectedOption[],
    specialInstructions: string,
    quantity: number
  ) => void;
}

export function ItemCustomizationModal({
  vendor,
  item,
  onClose,
  onAddToCart,
}: ItemCustomizationModalProps) {
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    item.optionGroups?.forEach((group) => {
      if (group.required && group.choices.length > 0) {
        initial[group.id] = [group.choices[0].id];
      } else {
        initial[group.id] = [];
      }
    });
    return initial;
  });

  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const selectedOptions: SelectedOption[] = useMemo(() => {
    const result: SelectedOption[] = [];
    item.optionGroups?.forEach((group) => {
      const ids = selectedByGroup[group.id] || [];
      ids.forEach((choiceId) => {
        const choice = group.choices.find((c) => c.id === choiceId);
        if (choice) {
          result.push({
            groupId: group.id,
            groupTitle: group.title,
            choiceId: choice.id,
            label: choice.label,
            priceDelta: choice.priceDelta,
          });
        }
      });
    });
    return result;
  }, [item.optionGroups, selectedByGroup]);

  const optionsTotal = selectedOptions.reduce((sum, opt) => sum + opt.priceDelta, 0);
  const unitPrice = item.priceEur + optionsTotal;
  const lineTotal = unitPrice * quantity;

  const missingRequired = (item.optionGroups || []).some(
    (group) => group.required && (!selectedByGroup[group.id] || selectedByGroup[group.id].length === 0)
  );

  const toggleChoice = (groupId: string, choiceId: string, required: boolean, maxSelect: number) => {
    setSelectedByGroup((prev) => {
      const current = prev[groupId] || [];
      if (maxSelect === 1) {
        if (current.includes(choiceId) && !required) {
          return {...prev, [groupId]: []};
        }
        return {...prev, [groupId]: [choiceId]};
      }

      if (current.includes(choiceId)) {
        return {...prev, [groupId]: current.filter((id) => id !== choiceId)};
      }

      if (current.length >= maxSelect) {
        return {...prev, [groupId]: [...current.slice(1), choiceId]};
      }
      return {...prev, [groupId]: [...current, choiceId]};
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customize-item-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-zinc-500">{vendor.name}</p>
            <h2 id="customize-item-title" className="font-display text-xl font-bold text-zinc-900 mt-0.5">
              {item.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close item options"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-sm text-zinc-600 leading-relaxed">{item.description}</p>

          {item.optionGroups?.map((group) => {
            const currentIds = selectedByGroup[group.id] || [];
            return (
              <div key={group.id} className="space-y-3 pt-4 border-t border-zinc-100">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-zinc-900">{group.title}</h3>
                  <span className="text-xs text-zinc-500">
                    {group.required ? 'Required' : `Optional · Up to ${group.maxSelect}`}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.choices.map((choice) => {
                    const checked = currentIds.includes(choice.id);
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => toggleChoice(group.id, choice.id, group.required, group.maxSelect)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-colors cursor-pointer ${
                          checked
                            ? 'border-[#FF5E1A] bg-[#FF5E1A]/5 text-zinc-900'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-4 h-4 flex items-center justify-center border ${
                              group.maxSelect === 1 ? 'rounded-full' : 'rounded'
                            } ${
                              checked
                                ? 'border-[#FF5E1A] bg-[#FF5E1A]'
                                : 'border-zinc-300 bg-white'
                            }`}
                          >
                            {checked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <span className="text-sm font-medium">{choice.label}</span>
                        </div>
                        <span className="text-xs font-medium text-zinc-600 tabular-nums shrink-0">
                          {choice.priceDelta > 0 ? `+€${choice.priceDelta.toFixed(2)}` : 'Included'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t border-zinc-100">
            <label htmlFor="special-instructions" className="block text-sm font-semibold text-zinc-900 mb-2">
              Special instructions
            </label>
            <textarea
              id="special-instructions"
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Allergies, extra lemon, or packaging notes..."
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#FF5E1A] focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 bg-stone-50 flex items-center justify-between gap-4">
          <div className="inline-flex items-center border border-zinc-200 rounded-lg bg-white">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="p-2.5 text-zinc-700 hover:text-zinc-900 disabled:opacity-40 cursor-pointer"
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-semibold text-zinc-900 tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="p-2.5 text-zinc-700 hover:text-zinc-900 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            disabled={missingRequired}
            onClick={() => onAddToCart(item, selectedOptions, instructions.trim(), quantity)}
            className="flex-1 py-3 px-5 rounded-xl bg-[#FF5E1A] hover:bg-[#E54B0B] disabled:bg-zinc-300 text-white text-sm font-semibold transition-colors tabular-nums cursor-pointer"
          >
            Add to Basket · €{lineTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
