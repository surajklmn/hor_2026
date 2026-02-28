"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Megaphone, X, ChevronDown, Loader2 } from "lucide-react";
import { Petition } from "@/types";

// ─── Zod schema ───────────────────────────────────────────────────────────
const petitionSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(120, "Title must be under 120 characters"),
  description: z
    .string()
    .min(30, "Description must be at least 30 characters")
    .max(1000, "Description must be under 1000 characters"),
  category: z.enum(
    [
      "Roads",
      "Water",
      "Policy",
      "Education",
      "Healthcare",
      "Environment",
    ] as const,
    { message: "Please select a category" },
  ),
  constituency_id: z.string().min(1, "Please select a constituency"),
});

type FormData = z.infer<typeof petitionSchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

// ─── Props ───────────────────────────────────────────────────────────────────
interface PetitionFormProps {
  preselectedConstituencyId?: string | null;
  preselectedConstituencyName?: string | null;
  constituencyOptions: Array<{ id: string; name: string }>;
  onSubmit: (petition: Petition) => void;
  onClose: () => void;
}

const CATEGORIES: FormData["category"][] = [
  "Roads",
  "Water",
  "Policy",
  "Education",
  "Healthcare",
  "Environment",
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function PetitionForm({
  preselectedConstituencyId,
  preselectedConstituencyName,
  constituencyOptions,
  onSubmit,
  onClose,
}: PetitionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "Roads",
    constituency_id: preselectedConstituencyId ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [search, setSearch] = useState(preselectedConstituencyName ?? "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sync when preselected changes
  useEffect(() => {
    if (preselectedConstituencyId) {
      setFormData((prev) => ({
        ...prev,
        constituency_id: preselectedConstituencyId,
      }));
      setSearch(preselectedConstituencyName ?? preselectedConstituencyId);
    }
  }, [preselectedConstituencyId, preselectedConstituencyName]);

  const filteredOptions = constituencyOptions.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()),
  );

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = petitionSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof FormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    // Simulate async submission
    await new Promise((r) => setTimeout(r, 800));

    const selectedOption = constituencyOptions.find(
      (o) => o.id === formData.constituency_id,
    );
    const newPetition: Petition = {
      id: `pet-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      constituency_id: formData.constituency_id,
      constituency_name: selectedOption?.name ?? formData.constituency_id,
      upvotes: 1,
      downvotes: 0,
      status: "Collecting Signatures",
      created_at: new Date().toISOString().split("T")[0],
      target: 5000,
    };

    onSubmit(newPetition);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-10 px-6 text-center">
        <div className="bg-emerald-100 rounded-full p-4">
          <Megaphone size={32} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Petition Submitted!
          </h3>
          <p className="text-sm text-gray-500">
            Your petition is now live and collecting signatures.
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-2 px-6 py-2.5 rounded-xl bg-blue-900 text-white font-semibold text-sm hover:bg-blue-800 transition-colors"
        >
          View Petitions
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-blue-900 p-1.5 rounded-lg">
            <Megaphone size={16} className="text-white" />
          </div>
          <h2 className="font-bold text-gray-900">Start a Petition</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Petition Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="e.g. Repair the main highway through our district"
            className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
              errors.title
                ? "border-rose-300 bg-rose-50"
                : "border-gray-200 bg-gray-50 hover:bg-white focus:bg-white"
            }`}
          />
          {errors.title && (
            <p className="text-sm text-rose-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Describe the issue clearly and what action you are demanding..."
            className={`w-full px-3 py-2.5 rounded-xl border text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
              errors.description
                ? "border-rose-300 bg-rose-50"
                : "border-gray-200 bg-gray-50 hover:bg-white focus:bg-white"
            }`}
          />
          <div className="flex justify-between">
            {errors.description ? (
              <p className="text-sm text-rose-600">{errors.description}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-gray-400">
              {formData.description.length}/1000
            </span>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleChange("category", cat)}
                className={`py-2 px-3 rounded-xl text-sm font-semibold border transition-all ${
                  formData.category === cat
                    ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="text-sm text-rose-600">{errors.category}</p>
          )}
        </div>

        {/* Constituency searchable dropdown */}
        <div className="space-y-1.5 relative">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Constituency <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
                if (!e.target.value) handleChange("constituency_id", "");
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search constituency..."
              className={`w-full px-3 py-2.5 pr-9 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                errors.constituency_id
                  ? "border-rose-300 bg-rose-50"
                  : "border-gray-200 bg-gray-50 hover:bg-white focus:bg-white"
              }`}
            />
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          {showDropdown && filteredOptions.length > 0 && (
            <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
              {filteredOptions.slice(0, 40).map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange("constituency_id", opt.id);
                      setSearch(opt.name);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <span className="font-medium">{opt.name}</span>
                    <span className="text-gray-400 ml-1.5">({opt.id})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {errors.constituency_id && (
            <p className="text-sm text-rose-600">{errors.constituency_id}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-blue-900/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Megaphone size={16} />
              Raise Your Voice
            </>
          )}
        </button>
      </form>
    </div>
  );
}
