# Standard Notes 日本語化 + IME修正

## 📌 概要

このユーザースクリプトは、**Standard Notes Webアプリ**を日本語化し、**Firefoxでの日本語入力（IME）に関するバグ**を修正します。

- ✨ UI全体を日本語に翻訳（設定、サイドバー、メニュー、バックアップ等あらゆる要素をカバー）
- 🧠 Firefoxでのタイトル入力時に文字変換でEnterキーを押した際に本文に移動してしまうバグを回避
- 🖋️ 編集エリアのフォントも調整し、より快適な日本語入力環境を提供

---

## ⚙️ インストール手順

1. ブラウザにユーザースクリプトマネージャーを導入  
   - 推奨: [Violentmonkey](https://violentmonkey.github.io/) または [Tampermonkey](https://www.tampermonkey.net/)
2. スクリプトを以下からインストール  
   👉 [standardnotes-ja-localizer.user.js](https://raw.githubusercontent.com/koyasi777/standardnotes-ja-localizer/main/standardnotes-ja-localizer.user.js)

---

## 💡 主な機能

- UIテキストの自動日本語化（SPA対応、動的要素も網羅）
- Firefoxにおける日本語入力中のEnter誤作動防止（compositionイベント対応）
- 編集エリアのフォントを整え、可読性を向上

---

## 🖥 対応サイト

- https://app.standardnotes.com/*

---

## 🧠 技術ポイント

- `MutationObserver` による動的DOMへの対応
- TextNodeベースの再帰的翻訳
- `compositionstart` / `compositionend` によるIME検出処理
- `localStorage` や `fetch` などの外部権限不要（`@grant none`）

---

## 📜 ライセンス

MIT License  
商用・非商用問わず自由に利用・改変・再配布可能です。  
※ご利用は自己責任でお願いいたします。

---

> 🇯🇵 日本語ユーザーのための Standard Notes 改善ツールです。
> より自然なUIで、快適なノート体験を。
