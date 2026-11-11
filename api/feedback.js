// api/feedback.js
// Vercel Serverless Function for 방명록/피드백 CRUD
// 보안: 서버 전용 Supabase Service Role Key 사용, 클라이언트에 노출되지 않음
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('feedback')
      .select('id, name, message, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { name, message } = req.body;
    if (!name?.trim() || !message?.trim()) {
      return res.status(400).json({ error: '이름과 메시지는 필수입니다.' });
    }
    const { data, error } = await supabase
      .from('feedback')
      .insert([{ name: name.trim(), message: message.trim() }])
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

