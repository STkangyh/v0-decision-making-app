"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getUser, updateUser } from "@/lib/user";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast-provider";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = getUser();
  const { show: showToast } = useToast();

  // Edit form state
  const [oldPw, setOldPw] = useState("");
  const [newNick, setNewNick] = useState(user?.nickname || "");
  const [newPw, setNewPw] = useState("");
  const [editErr, setEditErr] = useState("");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  async function handleSaveEdit() {
    if (oldPw !== user?.password) {
      setEditErr("기존 비밀번호가 틀립니다");
      return;
    }
    if (newNick.trim().length > 10 || !newNick.trim()) {
      setEditErr("닉네임은 1~10자");
      return;
    }
    if (newPw && (!/^[a-zA-Z0-9]+$/.test(newPw) || newPw.length > 20)) {
      setEditErr("비밀번호: 영문+숫자, 20자 이내");
      return;
    }

    const updates: { nickname?: string; password?: string } = {};
    if (newNick.trim() !== user.nickname) updates.nickname = newNick.trim();
    if (newPw) updates.password = newPw;

    // Update Supabase
    await supabase
      .from("users")
      .update(updates)
      .eq("anon_id", user.anonId);

    // Update local
    updateUser(updates);
    showToast("정보가 수정되었습니다");
    setEditing(false);
    setOpen(false);
    setOldPw("");
    setNewPw("");
    setEditErr("");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen(!open);
          setEditing(false);
        }}
        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
      >
        <UserCircle className="w-5 h-5 text-white/70" />
      </button>

      {open && !editing && (
        <div className="absolute right-0 top-12 w-56 bg-gray-900 border border-white/10 rounded-2xl p-3 shadow-2xl z-50">
          <div className="px-3 py-2 text-sm font-semibold text-white truncate">
            {user.nickname}
          </div>
          <div className="border-t border-white/10 my-1" />
          <Link
            href="/my-posts"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            내 게시물 보기
          </Link>
          <button
            onClick={() => {
              setEditing(true);
              setNewNick(user.nickname);
            }}
            className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            정보 수정
          </button>
        </div>
      )}

      {open && editing && (
        <div className="absolute right-0 top-12 w-72 bg-gray-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
          <h3 className="text-sm font-bold text-white mb-3">정보 수정</h3>
          <div className="space-y-3">
            <Input
              placeholder="새 닉네임"
              value={newNick}
              onChange={(e) => setNewNick(e.target.value)}
              maxLength={10}
              className="bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-xl h-10 text-sm"
            />
            <Input
              type="password"
              placeholder="새 비밀번호 (변경 시에만)"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              maxLength={20}
              className="bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-xl h-10 text-sm"
            />
            <Input
              type="password"
              placeholder="기존 비밀번호 확인"
              value={oldPw}
              onChange={(e) => setOldPw(e.target.value)}
              className="bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-xl h-10 text-sm"
            />
          </div>
          {editErr && (
            <p className="text-red-400 text-xs mt-2">{editErr}</p>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                setEditing(false);
                setEditErr("");
              }}
              className="flex-1 py-2 rounded-xl bg-white/10 text-white/70 text-sm font-semibold"
            >
              취소
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 py-2 rounded-xl bg-white text-black text-sm font-semibold"
            >
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
