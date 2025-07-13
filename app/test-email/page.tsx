// app/test-email/page.tsx
"use client";

import { useState } from "react";

export default function TestEmailPage() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testEmail = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Success: ${data.message} (ID: ${data.messageId})`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Network Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Email</h1>

      <div className="space-y-4">
        <input
          type="email"
          placeholder="Enter test email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <button onClick={testEmail} disabled={loading || !email} className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50">
          {loading ? "Sending..." : "Send Test Email"}
        </button>

        {result && (
          <div className="p-4 border rounded bg-gray-50">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
