import { useEffect, useState } from "react";

const API_URL = "https://5zpv9paaib.execute-api.eu-west-2.amazonaws.com/book";

// Reuse the same admin token auth pattern as admin.tsx
function useAdminToken() {
  const buildToken = import.meta.env.VITE_ADMIN_TOKEN || "";
  const [token] = useState<string>(
    localStorage.getItem("admin_token") || buildToken
  );
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [input, setInput] = useState("");
  const [err, setErr] = useState("");

  const validate = async (candidate: string) => {
    setChecking(true);
    setErr("");
    try {
      const r = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${candidate}` },
        body: JSON.stringify({}),
      });
      if (r.status === 401) { setErr("Invalid token"); setAuthed(false); return; }
      setAuthed(true);
      localStorage.setItem("admin_token", candidate);
    } catch (e: any) {
      setErr(e.message || "Network error");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => { if (token) validate(token); }, []);

  return { authed, checking, err, input, setInput, validate };
}

export default function FootballPage() {
  const { authed, checking, err, input, setInput, validate } = useAdminToken();

  const defaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  };

  const [date, setDate] = useState(defaultDate);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: string; message?: string; total?: number; date?: string } | null>(null);

  const book = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ status: "error", message: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <div className="flex items-center justify-center min-h-screen text-zinc-500">Checking auth…</div>;
  }

  if (!authed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm space-y-4">
          <h1 className="text-lg font-bold">Admin login</h1>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            type="password"
            placeholder="Admin token"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && validate(input)}
          />
          {err && <p className="text-red-500 text-sm">{err}</p>}
          <button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-2 text-sm font-semibold"
            onClick={() => validate(input)}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm space-y-5">
        <h1 className="text-xl font-bold">⚽ Football Booker</h1>
        <p className="text-zinc-500 text-sm">Add a 9pm slot to your basket at Willesden.</p>

        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">Date</label>
          <input
            type="date"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
          onClick={book}
          disabled={loading}
        >
          {loading ? "Adding to basket…" : "Add to Basket"}
        </button>

        {result && (
          <div className={`rounded-lg p-3 text-sm ${result.status === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
            {result.status === "success" ? (
              <>
                ✅ Added for <strong>{result.date}</strong> — £{result.total?.toFixed(2)}
                <br />
                <a
                  href="https://legacyleisure.legendonlineservices.co.uk/willesden/universalbasket/summary"
                  target="_blank"
                  rel="noreferrer"
                  className="underline mt-1 inline-block"
                >
                  → Go to basket to pay
                </a>
              </>
            ) : (
              <>❌ {result.message || "Something went wrong"}</>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
