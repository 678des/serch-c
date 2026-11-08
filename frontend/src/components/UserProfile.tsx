import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

type UserContext = {
  career_goal: string;
  interests: string;
  current_actions: string;
  worries: string;
};

const emptyContext: UserContext = {
  career_goal: "",
  interests: "",
  current_actions: "",
  worries: "",
};

export function UserProfile() {
  const [context, setContext] = useState<UserContext>(emptyContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadContext = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user-context`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await supabase.auth.getSession().then((session) => session.data.session?.access_token)}`,
          },
        });
        if (!response.ok)
          throw new Error("ユーザー情報を読み込めませんでした。");
        const data = await response.json();
        setContext({ ...emptyContext, ...data });
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "読み込みに失敗しました。",
        );
      } finally {
        setLoading(false);
      }
    };
    void loadContext();
  }, []);

  const persistContext = async (): Promise<UserContext> => {
    const session = await supabase.auth.getSession();
    console.log("Current session:", session);
    const accessToken = session.data.session?.access_token;
    const response = await fetch(`${API_URL}/api/user-context`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(context),
    });
    if (!response.ok)
      throw new Error("保存できませんでした。もう一度お試しください。");
    const savedContext = { ...emptyContext, ...(await response.json()) };
    setContext(savedContext);
    return savedContext;
  };

  const saveContext = async (event: FormEvent<HTMLFormElement>) => {
    console.log("送信します", context);
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await persistContext();
      setMessage("保存しました。これからの記事評価に反映されます。");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "保存に失敗しました。",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <main className="flex-1 p-6">ユーザー情報を読み込み中…</main>;

  return (
    <main className="flex-1 bg-white p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">あなたのコンテクスト</h1>
        <p className="mt-2 text-sm text-slate-600">
          ここに保存した情報を、新しい記事のスコアリング時にAIへ渡します。記事と無理に結びつけず、関係が薄いものは低く評価するよう指示します。
        </p>

        <form onSubmit={saveContext} className="mt-6 space-y-5">
          <label className="block text-sm font-medium">
            長期的に目指したいこと
            <textarea
              value={context.career_goal}
              onChange={(event) =>
                setContext((prev) => ({
                  ...prev,
                  career_goal: event.target.value,
                }))
              }
              className="mt-1 w-full rounded border border-slate-300 p-3"
              placeholder="例：フルスタックWebエンジニアを目指す"
            />
          </label>

          <label className="block text-sm font-medium">
            今していること
            <textarea
              value={context.current_actions}
              onChange={(event) =>
                setContext((prev) => ({
                  ...prev,
                  current_actions: event.target.value,
                }))
              }
              className="mt-1 w-full rounded border border-slate-300 p-3"
              placeholder="今気になっていること、学びたいこと"
            />
          </label>

          <label className="block text-sm font-medium">
            興味のあるテーマ（1行に1つ）
            <textarea
              value={context.interests}
              onChange={(event) =>
                setContext((prev) => ({
                  ...prev,
                  interests: event.target.value,
                }))
              }
              className="mt-1 w-full rounded border border-slate-300 p-3"
              placeholder={
                "TypeScript\nAIとエンジニアのキャリア\nクラウドインフラ"
              }
            />
          </label>

          <label className="block text-sm font-medium">
            不安や悩み
            <textarea
              value={context.worries}
              onChange={(event) =>
                setContext((prev) => ({ ...prev, worries: event.target.value }))
              }
              className="mt-1 w-full rounded border border-slate-300 p-3"
              placeholder=""
            />
          </label>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "保存中…" : "保存する"}
            </button>
            {message && (
              <p role="status" className="text-sm text-slate-600">
                {message}
              </p>
            )}
          </div>
        </form>

        <section className="mt-10 border-t border-slate-200 pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4"></div>
        </section>
      </div>
    </main>
  );
}
