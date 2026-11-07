import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")

# Supabaseクライアントのインスタンスを生成してエクスポート
supabase_anon: Client = create_client(
    SUPABASE_URL, 
    os.environ.get("SUPABASE_KEY")
)

supabase_admin: Client = create_client(
    SUPABASE_URL, 
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)