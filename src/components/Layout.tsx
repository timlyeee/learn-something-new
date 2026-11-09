import type { ReactNode } from "react";
import {
  House,
  MapTrifold,
  Stack,
  ChatCircle,
  Gear,
  Sparkle,
  Plant,
  Sun,
  CalendarCheck,
  ArrowLeft,
} from "@phosphor-icons/react";
import type { Page } from "../types";
const navigation: [Page, ReactNode, string][] = [
  ["home", <House size="1em" weight="regular" />, "学习概览"],
  ["courses", <MapTrifold size="1em" weight="regular" />, "学习路线"],
  ["kana", "あ", "五十音图"],
  ["words", <Stack size="1em" weight="regular" />, "单词记忆"],
  ["chat", <ChatCircle size="1em" weight="regular" />, "AI 对话"],
  ["settings", <Gear size="1em" weight="regular" />, "API 设置"],
];
export default function Layout({
  page,
  navigate,
  days,
  onBack,
  children,
}: {
  page: Page;
  navigate: (page: Page) => void;
  days: number;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <aside>
        <button className="brand" onClick={onBack}>
          <Sparkle size={26} weight="regular" aria-hidden="true" />
          学点新的？
        </button>
        <div className="tagline">Learn sth new?</div>
        <nav>
          {navigation.map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={page === id ? "active" : ""}
              aria-current={page === id ? "page" : undefined}
            >
              <i aria-hidden="true">{icon}</i>
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="quiet">
            <strong>一小步，也是一种进步。</strong>没有广告，没有会员。
            <br />
            只专注于你的每一次成长。
          </div>
          <div className="profile">
            <div className="avatar" aria-hidden="true">
              <Plant size={20} weight="regular" />
            </div>
            <div>
              学习者<small>从今天开始，慢慢来</small>
            </div>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <span className="breadcrumb">
            <button type="button" className="breadcrumb-back" onClick={onBack}>
              <ArrowLeft size={14} weight="bold" />
              返回模块
            </button>
            <span className="breadcrumb-sep" aria-hidden="true">
              /
            </span>
            <span>{navigation.find((n) => n[0] === page)?.[2]}</span>
          </span>
          <div className="header-right">
            <span className="pill">
              <CalendarCheck size={16} weight="regular" /> 已学习 {days} 天
            </span>
            <span>
              你好，学习者 <Sun size={16} weight="regular" />
            </span>
          </div>
        </header>
        {children}
        <div className="footer">每天一点，学点新的。</div>
      </main>
    </>
  );
}
