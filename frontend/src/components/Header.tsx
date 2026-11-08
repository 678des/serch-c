import React from "react";
import { createClient, type User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
// 環境変数などからSupabaseクライアントを初期化
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLIC_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    // 1. ページを開いたときに、すでにログインしているかチェック
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. ログインやログアウトの状態変化をリアルタイムで監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  const handleGitHubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        // ログイン成功したあとに戻ってくる自分のサイトのURL
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("GitHubログインエラー:", error.message);
    }
  };
  return (
    <header className="bg-blue-600 text-white p-4 flex items-center justify-between">
      <h1 className="text-xl font-bold">ITニュース</h1>
      {!user && (
        <button
          onClick={handleGitHubLogin}
          className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-200 ml-2"
        >
          サインアップ
        </button>
      )}
      {user && (
        <div className="ml-4">
          <span className="mr-2">{user.email}</span>
          <img
            src={user.user_metadata.avatar_url}
            alt="User Avatar"
            className="w-8 h-8 rounded-full inline-block mr-2"
          />
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setUser(null);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            ログアウト
          </button>
        </div>
      )}
    </header>
  );
}
