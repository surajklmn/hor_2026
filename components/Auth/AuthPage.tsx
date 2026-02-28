"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  NEPAL_PROVINCES,
  districtFromConstituencyId,
  provinceForDistrict,
} from "@/lib/nepal-geo";
import NavBar from "@/components/NavBar";

const NepalMap = dynamic(() => import("@/components/Map/NepalMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
      Loading Map…
    </div>
  ),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatConstituencyName(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({
  onSuccess,
  onSwitch,
}: {
  onSuccess: () => void;
  onSwitch: () => void;
}) {
  const { login } = useAuth();
  const [voterID, setVoterID] = useState("");
  const [showID, setShowID] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const err = login(voterID);
      if (err) {
        setError(err);
        setLoading(false);
      } else onSuccess();
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm mx-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Voter ID
        </label>
        <div className="relative">
          <input
            type={showID ? "text" : "password"}
            value={voterID}
            onChange={(e) => setVoterID(e.target.value)}
            placeholder="Enter your Voter ID"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowID((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showID ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !voterID.trim()}
        className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors"
      >
        {loading ? (
          <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
        ) : (
          <LogIn size={15} />
        )}
        {loading ? "Logging in…" : "Log In"}
      </button>

      <p className="text-center text-xs text-gray-500">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-blue-700 font-semibold hover:underline"
        >
          Sign Up
        </button>
      </p>
    </form>
  );
}

// ─── Signup Form ──────────────────────────────────────────────────────────────

function SignupForm({
  constituencyOptions,
  mapSelectedId,
  onSuccess,
  onSwitch,
}: {
  constituencyOptions: Array<{ id: string; name: string }>;
  mapSelectedId: string | null;
  onSuccess: () => void;
  onSwitch: () => void;
}) {
  const { register } = useAuth();
  const [voterID, setVoterID] = useState("");
  const [showID, setShowID] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [constituencyId, setConstituencyId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const districtList = useMemo<string[]>(
    () =>
      NEPAL_PROVINCES.find((p) => p.name === province)?.districts.sort() ?? [],
    [province],
  );

  const constituencyList = useMemo(
    () =>
      district
        ? constituencyOptions
            .filter(
              (opt) =>
                districtFromConstituencyId(opt.id).toLowerCase() ===
                district.toLowerCase(),
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [district, constituencyOptions],
  );

  // When map selection changes, auto-fill all three cascading fields
  useEffect(() => {
    if (!mapSelectedId) return;
    const derivedDistrict = districtFromConstituencyId(mapSelectedId);
    const derivedProvince = provinceForDistrict(derivedDistrict);
    if (derivedProvince) setProvince(derivedProvince);
    if (derivedDistrict) setDistrict(derivedDistrict);
    setConstituencyId(mapSelectedId);
  }, [mapSelectedId]);

  useEffect(() => {
    setDistrict("");
    setConstituencyId("");
  }, [province]);
  useEffect(() => {
    setConstituencyId("");
  }, [district]);

  const selectedConstituencyName =
    constituencyOptions.find((o) => o.id === constituencyId)?.name ?? "";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!voterID.trim()) return setError("Voter ID is required.");
    if (!name.trim()) return setError("Full name is required.");
    if (!dob) return setError("Date of birth is required.");
    if (!province) return setError("Please select your province.");
    if (!district) return setError("Please select your district.");
    if (!constituencyId) return setError("Please select your constituency.");
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const err = register({
        voterID,
        name,
        dob,
        province,
        district,
        constituencyId,
        constituencyName: selectedConstituencyName,
      });
      if (err) {
        setError(err);
        setLoading(false);
      } else onSuccess();
    }, 400);
  };

  const mapHint = mapSelectedId && constituencyId === mapSelectedId;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {/* Voter ID */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Voter ID <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showID ? "text" : "password"}
            value={voterID}
            onChange={(e) => setVoterID(e.target.value)}
            placeholder="e.g. NPC-123456789"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowID((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showID ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name as on voter card"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* DOB */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Constituency section */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Constituency <span className="text-red-500">*</span>
          </h3>
          {mapHint && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <MapPin size={10} /> Filled from map
            </span>
          )}
        </div>

        {/* Province */}
        <div className="space-y-2.5">
          <div className="relative">
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Province</option>
              {NEPAL_PROVINCES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!province}
              className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {province ? "Select District" : "Select province first"}
              </option>
              {districtList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              value={constituencyId}
              onChange={(e) => setConstituencyId(e.target.value)}
              disabled={!district || constituencyList.length === 0}
              className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {!district
                  ? "Select district first"
                  : constituencyList.length === 0
                    ? "No constituencies found"
                    : "Select Constituency"}
              </option>
              {constituencyList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors"
      >
        {loading ? (
          <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
        ) : (
          <UserPlus size={15} />
        )}
        {loading ? "Creating account…" : "Create Account"}
      </button>

      <p className="text-center text-xs text-gray-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-blue-700 font-semibold hover:underline"
        >
          Log In
        </button>
      </p>
    </form>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const initialMode =
    searchParams.get("mode") === "signup" ? "signup" : "login";
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [constituencyOptions, setConstituencyOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [mapSelectedId, setMapSelectedId] = useState<string | null>(null);
  const [mapSelectedName, setMapSelectedName] = useState<string | null>(null);

  // Already logged in → redirect
  useEffect(() => {
    if (user) router.replace(redirectTo);
  }, [user, router, redirectTo]);

  // Fetch constituency options for signup dropdown
  useEffect(() => {
    fetch("/data/candidates.json")
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const opts = Object.keys(data)
          .map((id) => ({ id, name: formatConstituencyName(id) }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setConstituencyOptions(opts);
      })
      .catch(console.error);
  }, []);

  const handleSuccess = () => router.push(redirectTo);

  const handleMapSelect = (id: string | null, name: string | null) => {
    setMapSelectedId(id);
    setMapSelectedName(name);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />

      {/* Page header */}
      <div className="bg-blue-900 text-white py-10 px-4 text-center">
        <h1 className="text-2xl font-extrabold mb-1">
          {mode === "login" ? "Welcome Back" : "Create Your Account"}
        </h1>
        <p className="text-blue-200 text-sm">
          {mode === "login"
            ? "Log in with your Voter ID to participate in civic petitions"
            : "Register with your Voter ID and constituency to raise your voice"}
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex border-b border-gray-200 bg-white sticky top-14 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto w-full flex">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold border-b-2 transition-colors md:flex-none md:px-8 ${
              mode === "login"
                ? "border-blue-900 text-blue-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <LogIn size={15} />
            Log In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold border-b-2 transition-colors md:flex-none md:px-8 ${
              mode === "signup"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <UserPlus size={15} />
            Sign Up
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {mode === "login" ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitch={() => setMode("signup")}
          />
        ) : (
          /* Sign-up: 2-column on desktop (form left, map right) */
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left: form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <SignupForm
                constituencyOptions={constituencyOptions}
                mapSelectedId={mapSelectedId}
                onSuccess={handleSuccess}
                onSwitch={() => setMode("login")}
              />
            </div>

            {/* Right: map */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 pt-4 pb-2 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-800">
                  Select on Map
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Click your constituency on the map to auto-fill the fields
                </p>
                {mapSelectedId && (
                  <div className="mt-2 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
                    <MapPin
                      size={12}
                      className="text-emerald-600 flex-shrink-0"
                    />
                    <span className="text-xs font-semibold text-emerald-700">
                      {mapSelectedName}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ height: 440 }} className="relative">
                <NepalMap onConstituencySelect={handleMapSelect} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
