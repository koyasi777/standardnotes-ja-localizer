// ==UserScript==
// @name         Standard Notes 日本語化 & IME修正
// @version      1.7.3
// @description  Standard Notesを完全に日本語化し、FirefoxでのIME入力バグを修正します。
// @namespace    https://github.com/koyasi777/standardnotes-ja-localizer
// @author       koyasi777
// @match        https://app.standardnotes.com/*
// @grant        none
// @license      MIT
// @homepageURL  https://github.com/koyasi777/standardnotes-ja-localizer
// @supportURL   https://github.com/koyasi777/standardnotes-ja-localizer/issues
// @icon         https://app.standardnotes.com/favicon/favicon-32x32.png
// ==/UserScript==

(function () {
  'use strict';

  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

  const applyEditorStyle = () => {
    const editor = document.getElementById('note-text-editor');
    if (editor) {
      editor.style.fontFamily = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`;
    }
  };

  const setupTitleField = () => {
    const titleInput = document.getElementById('note-title-editor');
    if (!titleInput || titleInput.dataset.enterHandled) return;
    titleInput.dataset.enterHandled = 'true';
    if (!isFirefox) return;

    let isComposing = false;
    let preventNextBlur = false;
    let savedStart = 0;
    let savedEnd = 0;

    titleInput.addEventListener('compositionstart', () => {
      isComposing = true;
    });

    titleInput.addEventListener('compositionend', () => {
      isComposing = false;
      preventNextBlur = true;

      // IME確定「後」のキャレット位置を次のtickで取得する
      setTimeout(() => {
        savedStart = titleInput.selectionStart;
        savedEnd = titleInput.selectionEnd;
      }, 0);
    });

    titleInput.addEventListener('blur', () => {
      if (preventNextBlur) {
        preventNextBlur = false;
        setTimeout(() => {
          titleInput.focus();
          titleInput.setSelectionRange(savedStart, savedEnd);  // ← 確定後のカーソル位置に復元
        }, 0);
      }
    });

    titleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        setTimeout(() => {
          titleInput.focus();
          titleInput.setSelectionRange(savedStart, savedEnd); // ← same as blur復元
        }, 0);
      }
    }, true);

  };

  const translateTextNode = (el, map) => {
    if (!el || el.childNodes.length === 0) return;
    el.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const t = child.nodeValue.trim();
        if (map[t]) child.nodeValue = map[t];
      } else {
        translateTextNode(child, map);
      }
    });
  };

  const localizeDisplayOptions = () => {
    const map = {
      "Display options": "表示オプション",
      "Done": "完了",
      "Preferences for": "次の設定対象",
      "Sort by": "並び替え順",
      "Date modified": "変更日",
      "Creation date": "作成日",
      "Title": "タイトル",
      "View": "表示形式",
      "Show note preview": "ノートプレビューを表示",
      "Show date": "日付を表示",
      "Show tags": "タグを表示",
      "Show icon": "アイコンを表示",
      "Other": "その他",
      "Show pinned": "ピン留めを表示",
      "Show protected": "保護されたノートを表示",
      "Show archived": "アーカイブ済みノートを表示",
      "Show trashed": "ゴミ箱内ノートを表示",
      "New note defaults": "新規ノートのデフォルト設定",
      "Note Type": "ノートタイプ",
      "Title Format": "タイトル形式",
      "Current date and time": "現在の日時",
      "Current note count": "ノート数",
      "Custom format": "カスタム形式",
      "Empty": "空欄"
    };

    const translate = () => {
      document.querySelectorAll('[data-popover], [role="menuitemradio"], [role="menuitemcheckbox"], button, span, div')
        .forEach(el => translateTextNode(el, map));
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const localizeSidebarViews = () => {
    const map = {
      "Views": "ビュー",
      "Notes": "ノート一覧",
      "Files": "ファイル",
      "Starred": "お気に入り",
      "Archived": "アーカイブ",
      "Trash": "ゴミ箱",
      "Untagged": "タグなし",
      "Create a new smart view": "スマートビューを作成"
    };

    const translate = () => {
      document.querySelectorAll('.section-title-bar .title, #react-tag-all-notes, #react-tag-files, #react-tag-starred-notes, #react-tag-archived-notes, #react-tag-trashed-notes, #react-tag-untagged-notes')
        .forEach(el => translateTextNode(el, map));

      const btn = document.querySelector('button[title="Create a new smart view"]');
      if (btn) {
        btn.title = map[btn.title] || btn.title;
        btn.setAttribute('aria-label', btn.title);
      }
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const localizeTagsSection = () => {
    const map = {
      "Tags": "タグ",
      "Folders": "フォルダ",
      "Create a new tag (Ctrl+Alt+N)": "タグを作成（Ctrl+Alt+N）"
    };

    const translate = () => {
      document.querySelectorAll('.section-title-bar .title').forEach(el => translateTextNode(el, map));
      const btn = document.querySelector('button[title="Create a new tag (Ctrl+Alt+N)"]');
      if (btn) {
        btn.title = map[btn.title] || btn.title;
        btn.setAttribute('aria-label', btn.title);
      }
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const localizeSearchBoxes = () => {
    const map = {
      "Search...": "検索...",
      "Search tags...": "タグを検索..."
    };

    const translate = () => {
      document.querySelectorAll('input[placeholder]').forEach(input => {
        const p = input.placeholder.trim();
        if (map[p]) input.placeholder = map[p];
      });
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const localizeSearchMessages = () => {
    const map = {
      "No smart views found. Try a different search.": "スマートビューが見つかりません。他の検索条件をお試しください。",
      "No tags found. Try a different search.": "タグが見つかりません。他の検索条件をお試しください。",
    };
    const translate = () => {
      // サイドバーのナビゲーションコンテンツだけを限定
      document.querySelectorAll('#navigation-content section').forEach(section => {
        section.querySelectorAll('div').forEach(el => {
          const raw = el.textContent.trim();
          if (map[raw]) el.textContent = map[raw];
        });
      });
    };
    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const localizeFilterButtons = () => {
    const map = {
      "Protected Contents": "保護されたノート",
      "Archived": "アーカイブ済み",
      "Trashed": "ゴミ箱"
    };

    const translate = () => {
      document.querySelectorAll('button[role="checkbox"]').forEach(btn => {
        if (map[btn.textContent.trim()]) {
          btn.textContent = map[btn.textContent.trim()];
        }
      });
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const localizeNoteOptionsMenu = () => {
    const map = {
      "Note history": "ノート履歴",
      "Editor width": "エディタ幅",
      "Prevent editing": "編集禁止",
      "Show preview": "プレビューを表示",
      "Password protect": "パスワード保護",
      "Change note type": "ノートタイプ変更",
      "Add tag": "タグを追加",
      "Star": "スターを付ける",
      "Pin to top": "トップに固定",
      "Export": "エクスポート",
      "Duplicate": "複製",
      "Archive": "アーカイブ",
      "Move to trash": "ゴミ箱に移動",
      "Listed actions": "アクション一覧",
      "Spellcheck": "スペルチェック",
      "Restore": "元に戻す",
      "Delete permanently": "完全に削除",
      "Empty Trash": "ゴミ箱を空にする",
      "Unstar": "お気に入りから外す",
      "Unarchive": "アーカイブを解除",
    };

    const translate = () => {
      // ボタン要素＋danger系span/divも含めて走査
      document.querySelectorAll('menu [role="menuitem"], [role="menuitemcheckbox"], span.text-danger, div.text-danger')
        .forEach(button => {
          button.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
              const raw = child.nodeValue.trim();
              if (map[raw]) child.nodeValue = map[raw];
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              child.childNodes.forEach(grandchild => {
                if (grandchild.nodeType === Node.TEXT_NODE) {
                  const raw = grandchild.nodeValue.trim();
                  if (map[raw]) grandchild.nodeValue = map[raw];
                }
              });
            }
          });
          // さらに、span/div/button自身のtextContentが厳密一致した場合は全置換（特にEmpty Trash用）
          if (map[button.textContent.trim()]) button.textContent = map[button.textContent.trim()];
        });

      // notes in Trash の件数対応
      document.querySelectorAll('.text-xs').forEach(span => {
        const match = span.textContent.trim().match(/^(\d+)\s+notes in Trash$/);
        if (match) {
          span.textContent = `${match[1]} 件のノートがゴミ箱内にあります`;
        }
      });
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const localizeNoteFooterInfo = () => {
    const map = {
      "Read time:": "読了時間：",
      "Last modified:": "最終更新：",
      "Created:": "作成日：",
      "Note ID:": "ノートID：",
      "Size:": "サイズ："
    };

    const translate = () => {
      document.querySelectorAll('.select-text span.font-semibold').forEach(span => {
        const raw = span.textContent.trim();
        if (map[raw]) span.textContent = map[raw];
      });
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const localizeChallengeModal = () => {
    const map = {
      "Authentication is required to approve this note for Listed": "このノートをListedに公開するには認証が必要です",
      "Account Password": "アカウントのパスワード",
      "Show/hide password": "パスワードを表示/非表示",
      "Allow protected access for": "保護されたアクセスの許可期間",
      "1 Minute": "1分",
      "5 Minutes": "5分",
      "1 Hour": "1時間",
      "1 Week": "1週間",
      "Submit": "送信"
    };

    const translate = () => {
      // テキストノードに直接含まれる要素もあるので汎用処理
      document.querySelectorAll('[role="dialog"], [data-dialog]').forEach(dialog => {
        translateTextNode(dialog, map);
      });

      // input の placeholder は別途対応
      document.querySelectorAll('input[placeholder]').forEach(input => {
        const p = input.placeholder.trim();
        if (map[p]) input.placeholder = map[p];
      });

      // button の aria-label など
      document.querySelectorAll('button[aria-label]').forEach(btn => {
        const label = btn.getAttribute('aria-label');
        if (map[label]) btn.setAttribute('aria-label', map[label]);
      });

      // ラベルテキスト（1 Minute, 5 Minutesなど）
      document.querySelectorAll('label').forEach(label => {
        const text = label.textContent.trim();
        if (map[text]) label.textContent = map[text];
      });
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const localizeAccountMenu = () => {
    const map = {
      "Account": "アカウント",
      "You're signed in as:": "サインイン中:",
      "Last synced:": "最終同期:",
      "Switch workspace": "ワークスペースを切り替え",
      "Account settings": "アカウント設定",
      "Import": "インポート",
      "Help & feedback": "ヘルプとフィードバック",
      "Keyboard shortcuts": "キーボードショートカット",
      "Sign out workspace": "ワークスペースからサインアウト"
    };

    const translate = () => {
      // account menu 部分だけに限定して翻訳を適用
      const menu = document.querySelector('#account-menu');
      if (!menu) return;

      // 汎用的なテキストノード再帰翻訳
      translateTextNode(menu, map);
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const localizeQuickSettingsMenu = () => {
    const map = {
      "Appearance": "外観",
      "Default": "デフォルト",
      "Dark": "ダーク",
      "Autobiography": "オートバイオグラフィー",
      "Carbon": "カーボン",
      "Futura": "フューチュラ",
      "Midnight": "ミッドナイト",
      "Solarized Dark": "ソラライズドダーク",
      "Titanium": "チタニウム",
      "Dynamic Panels": "ダイナミックパネル",
      "Focus Mode": "フォーカスモード",
      "Show Tags Panel": "タグパネルを表示",
      "Show Notes Panel": "ノートパネルを表示"
    };

    const translate = () => {
      const menu = document.querySelector('[aria-label="Quick settings menu"]');
      if (!menu) return;
      translateTextNode(menu, map);
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };


  const localizePreferencesMenu = () => {
    const map = {
      "What's New": "新着情報",
      "Account": "アカウント",
      "General": "一般",
      "Security": "セキュリティ",
      "Backups": "バックアップ",
      "Appearance": "外観",
      "Listed": "Listed（公開）",
      "Plugins": "プラグイン",
      "Help & feedback": "ヘルプとフィードバック",
      "Preferences Menu": "設定メニュー"
    };

    const translate = () => {
      // デスクトップ用メニュー
      document.querySelectorAll(".preferences-menu-item").forEach(item => translateTextNode(item, map));

      // モバイル用ドロップダウン（ARIA labelがある部分）
      document.querySelectorAll('[aria-label="Preferences Menu"], [aria-labelledby]').forEach(node => {
        translateTextNode(node, map);
      });
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const localizePreferencesPanels = () => {
    const map = {
      // 見出し・セクション
      "When opening the app, show...": "アプリ起動時に表示する内容",
      "Defaults": "デフォルト設定",
      "New Note Defaults": "新規ノートのデフォルト設定",
      "Tools": "ツール",
      "Smart Views": "スマートビュー",
      "Moments": "モーメンツ",
      "Labs": "ラボ",

      // サブタイトルやチェックボックスラベル
      "The first note in the list": "ノート一覧の最初のノート",
      "The last viewed note": "最後に表示していたノート",
      "Spellcheck": "スペルチェック",
      "Add all parent tags when adding a nested tag to a note": "ネストタグ追加時に親タグも追加する",
      "Use always-visible toolbar in Super notes": "Superノートでツールバーを常時表示",
      "Show note saving status while editing": "編集中の保存ステータスを表示",
      "Upgrade for smart views": "スマートビュー機能のアップグレード",
      "Your personal photo journal": "あなたの写真日記",
      "Capture Present Moment": "今の瞬間を撮影",
      "No experimental features available.": "利用可能な実験的機能はありません。",

      // 説明文（必要に応じて細分化）
      "The default spellcheck value for new notes. Spellcheck can be configured per note from the note context menu. Spellcheck may degrade overall typing performance with long notes.":
        "新規ノートのデフォルトのスペルチェック設定です。スペルチェックは各ノートのメニューで個別に設定できます。長いノートでは入力パフォーマンスに影響する可能性があります。",
      "When enabled, adding a nested tag to a note will automatically add all associated parent tags.":
        "有効にすると、ネストされたタグをノートに追加した際に、親タグも自動的に追加されます。",
      "When enabled, the Super toolbar will always be shown at the top of the note. It can be temporarily toggled using Cmd/Ctrl+Shift+K. When disabled, the Super toolbar will only be shown as a floating toolbar when text is selected.":
        "有効時は、Superツールバーが常にノートの上部に表示されます（Cmd/Ctrl+Shift+Kで一時的に切り替え可能）。無効時は、テキスト選択時のみフローティング表示されます。",
      "Control whether the animated saving status is shown while editing. Error statuses are always shown regardless of preference.":
        "編集中にアニメーション付きの保存ステータスを表示するかを制御します。エラーは常に表示されます。",
      "Create smart views to organize your notes according to conditions you define.":
        "条件を定義して、ノートを整理するためのスマートビューを作成できます。",
      "Moments lets you capture photos of yourself throughout the day, creating a visual record of your life, one photo at a time. Using your webcam or mobile selfie-cam, Moments takes a photo of you every half hour. All photos are end-to-end encrypted and stored in your files. Enable Moments on a per-device basis to get started.":
        "Momentsは1日に複数回、自動的にあなたの写真を撮影し、ライフログとして視覚的に記録します。Webカメラやスマホの自撮りカメラを使用し、30分ごとに写真を撮影します。すべての写真はエンドツーエンド暗号化され、ファイルに保存されます。各デバイスで有効化できます。"
    };

    const translate = () => {
      const selectors = [
        'h1', 'h2', 'h4', 'label', 'p', 'button', 'div.text-base', 'div.text-sm',
      ];
      document.querySelectorAll(selectors.join(',')).forEach(el => translateTextNode(el, map));
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };


  const localizeSecurityAndPrivacySettings = () => {
    const map = {
      // セクションタイトル
      "Encryption": "暗号化",
      "Protections": "保護機能",
      "Two-factor authentication": "二要素認証",
      "Passcode lock": "パスコードロック",
      "Privacy": "プライバシー",

      // 小見出し・説明文
      "End-to-end encryption is enabled. Your data is encrypted on your device first, then synced to your private cloud.":
        "エンドツーエンド暗号化が有効になっています。データはまずデバイス上で暗号化され、その後プライベートクラウドに同期されます。",
      "Protections are enabled.": "保護機能は有効です。",
      "Actions like viewing or searching protected notes, exporting decrypted backups, or revoking an active session require additional authentication such as entering your account password or application passcode.":
        "保護されたノートの閲覧や検索、復号化されたバックアップのエクスポート、有効なセッションの取り消しなどの操作には、アカウントのパスワードまたはアプリのパスコードによる追加認証が必要です。",
      "An extra layer of security when logging in to your account.":
        "アカウントへのログイン時に追加のセキュリティを提供します。",
      "Add a passcode to lock the application and encrypt on-device key storage.":
        "パスコードを設定してアプリケーションをロックし、デバイス上のキー保管を暗号化します。",
      "Session user agent logging": "セッションのユーザーエージェント記録",
      "User agent logging allows you to identify the devices or browsers signed into your account. For increased privacy, you can disable this feature, which will remove all saved user agent values from our server, and disable future logging of this value.":
        "ユーザーエージェントの記録により、アカウントにサインインしているデバイスやブラウザを識別できます。プライバシーを強化するためにこの機能を無効にすると、保存された記録がサーバーから削除され、今後の記録も停止されます。",

      // 動的表示ラベル（ステータス）
      "notes": "件のノート",
      "files": "件のファイル",
      "tags": "件のタグ",
      "archived notes": "件のアーカイブされたノート",
      "trashed notes": "件のゴミ箱内ノート",
      "Add passcode": "パスコードを追加"
    };

    const translate = () => {
      const selectors = [
        'h1', 'h2', 'h4', 'p', 'button', 'div.text-sm', 'div.text-base'
      ];

      document.querySelectorAll(selectors.join(',')).forEach(el => translateTextNode(el, map));

      // 数値 + 英語の形式にも対応（例: "1876 notes" → "1876 件のノート"）
      document.querySelectorAll('div.text-sm').forEach(el => {
        const match = el.textContent.trim().match(/^(\d+)\s+(notes|files|tags|archived notes|trashed notes)$/);
        if (match && map[match[2]]) {
          el.textContent = `${match[1]} ${map[match[2]]}`;
        }
      });
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const translateElementTextContent = (el, map) => {
    if (!el) return;
    const fullText = el.textContent.trim();
    if (map[fullText]) {
      // replace entire content safely (even if contains <i> etc.)
      el.innerHTML = map[fullText];
    }
  };

  const localizeBackupSettings = () => {
    const map = {
      // セクションタイトル
      "Data backups": "データバックアップ",
      "Automatic text backups": "自動テキストバックアップ",
      "Automatic plaintext backups": "自動プレーンテキストバックアップ",
      "Automatic file backups": "自動ファイルバックアップ",
      "Email backups": "メールバックアップ",

      // 小見出し・ラベル
      "Download a backup of all your text-based data": "すべてのテキストデータのバックアップをダウンロード",
      "Encrypted": "暗号化済み",
      "Decrypted": "復号化済み",
      "Import a previously saved backup file": "保存済みバックアップファイルのインポート",
      "Automatically save encrypted and decrypted backups of your note and tag data.":
        "ノートおよびタグの暗号化・復号化バックアップを自動的に保存します。",
      "To enable text backups, use the Standard Notes desktop application.":
        "テキストバックアップを有効にするには、Standard Notesのデスクトップアプリをご使用ください。",
      "Automatically save backups of all your notes into plaintext, non-encrypted folders.":
        "すべてのノートをプレーンテキスト（暗号化なし）でフォルダにバックアップします。",
      "Automatically save encrypted backups of your files.":
        "ファイルの暗号化バックアップを自動保存します。",
      "To enable file backups, use the Standard Notes desktop application.":
        "ファイルバックアップを有効にするには、Standard Notesのデスクトップアプリをご使用ください。",
      "To decrypt a backup file, drag and drop the file's respective metadata.sn.json file here or select it below.":
        "バックアップファイルを復号化するには、対応する <i>metadata.sn.json</i> をここにドラッグ＆ドロップするか、下から選択してください。",
      "Receive daily encrypted email backups of all your notes directly in your email inbox.":
        "すべてのノートの暗号化メールバックアップを、毎日あなたの受信箱に直接送信します。",

      // メールバックアップの頻度設定
      "Frequency": "頻度",
      "How often to receive backups.": "バックアップの受信頻度を選択してください。",
      "No email backups": "メールバックアップなし",
      "Daily": "毎日",
      "Weekly": "毎週",

      // ボタン
      "Download backup": "バックアップをダウンロード",
      "Import backup": "バックアップをインポート",
      "Select file": "ファイルを選択"
    };

    const translate = () => {
      const selectors = [
        'h1', 'h2', 'h3', 'h4', 'p', 'span', 'button', 'div.text-base', 'div.text-sm'
      ];

      // 通常のTextNode変換
      document.querySelectorAll(selectors.join(',')).forEach(el => translateTextNode(el, map));

      // フォールバックとして textContent 全体一致の試行（タグ混在対応）
      document.querySelectorAll(selectors.join(',')).forEach(el => translateElementTextContent(el, map));
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };


  const localizeAppearanceAndEditorSettings = () => {
    const map = {
      // セクションタイトル
      "Themes": "テーマ",
      "Editor": "エディタ",

      // テーマ設定（見出し・説明）
      "Disable translucent UI": "半透明UIを無効化",
      "Use opaque style for UI elements instead of translucency":
        "UI要素を半透明ではなく不透明で表示します",

      "Use system color scheme": "システムのカラースキームを使用",
      "Automatically change active theme based on your system settings.":
        "システム設定に基づいてテーマを自動的に変更します",

      "Automatic Light Theme": "ライトモードの自動テーマ",
      "Theme to be used for system light mode:": "システムのライトモードで使用するテーマ:",

      "Automatic Dark Theme": "ダークモードの自動テーマ",
      "Theme to be used for system dark mode:": "システムのダークモードで使用するテーマ:",

      // テーマオプション名（そのまま表示されている場合）
      "Default": "デフォルト",
      "Dark": "ダーク",
      "Autobiography": "オートバイオグラフィー",
      "Carbon": "カーボン",
      "Futura": "フューチュラ",
      "Midnight": "ミッドナイト",
      "Solarized Dark": "ソラライズドダーク",
      "Titanium": "チタニウム",

      // エディタ設定
      "Monospace Font": "等幅フォント",
      "Toggles the font style in plaintext and Super notes":
        "プレーンテキストおよびSuperノートのフォントを等幅に切り替えます",

      "Font size": "フォントサイズ",
      "Sets the font size in plaintext and Super notes":
        "プレーンテキストおよびSuperノートのフォントサイズを設定します",

      "Line height": "行間",
      "Sets the line height (leading) in plaintext and Super notes":
        "プレーンテキストおよびSuperノートの行間（行送り）を設定します",

      "Editor width": "エディタの幅",
      "Sets the max editor width for all notes": "すべてのノートに対する最大エディタ幅を設定します",

      // 選択肢（ドロップダウンなど）
      "ExtraSmall": "極小",
      "Small": "小",
      "Normal": "標準",
      "Medium": "中",
      "Large": "大",

      "None": "なし",
      "Tight": "狭い",
      "Snug": "やや狭い",
      "Relaxed": "やや広い",
      "Loose": "広い",

      "Full width": "全幅"
    };

    const translate = () => {
      const selectors = [
        'h2', 'h4', 'p', 'div.text-base', 'div.text-sm', 'button', 'label'
      ];
      document.querySelectorAll(selectors.join(',')).forEach(el => translateTextNode(el, map));
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const localizeAccountPreferencesPanel = () => {
    const map = {
      // セクション見出し
      "Credentials": "認証情報",
      "Email": "メールアドレス",
      "Password": "パスワード",
      "Sync": "同期",
      "Subscription": "サブスクリプション",
      "Subscription sharing": "サブスクリプション共有",
      "Sign out": "サインアウト",
      "Delete account": "アカウント削除",

      // ボタン
      "Change email": "メールアドレスを変更",
      "Change password": "パスワードを変更",
      "Sync now": "今すぐ同期",
      "Subscribe": "購読する",
      "Upgrade": "アップグレード",
      "Learn More": "詳細を見る",
      "Sign out other sessions": "他のセッションをサインアウト",
      "Manage sessions": "セッションを管理",
      "Sign out workspace": "ワークスペースからサインアウト",
      "Delete my account": "アカウントを削除",

      // パラグラフ・説明文
      "You're signed in as": "サインイン中：",
      "Current password was set on": "現在のパスワードの設定日：",
      "Last synced": "最終同期：",
      "You don't have a Standard Notes subscription yet.": "まだStandard Notesのサブスクリプションに加入していません。",
      "Subscription sharing is available only on the": "サブスクリプション共有は",
      "plan. Please upgrade in order to share your subscription.": "プランでのみ利用可能です。共有するにはアップグレードしてください。",
      "Sign-in notification emails are available only on a": "サインイン通知メールは",
      "plan. Please upgrade in order to enable sign-in notifications.": "プランでのみ利用可能です。有効にするにはアップグレードが必要です。",
      "Mute sign-in notification emails": "サインイン通知メールをミュート",
      "Mute marketing notification emails": "マーケティング通知メールをミュート",
      "Disables email notifications with special deals and promotions.": "特別オファーやプロモーションに関する通知メールを無効にします。",
      "Other devices": "他のデバイス",
      "Want to sign out on all devices except this one?": "このデバイス以外からすべてサインアウトしますか？",
      "This workspace": "このワークスペース",
      "Remove all data related to the current workspace from the application.": "現在のワークスペースに関連するすべてのデータをアプリケーションから削除します。",
      "This action is irreversible. After deletion completes, you will be signed out on all devices.":
        "この操作は取り消せません。削除後、すべてのデバイスでサインアウトされます。"
    };

    const translate = () => {
      const selectors = [
        'h2', 'h4', 'p', 'span', 'button', 'a',
        'div.text-base', 'div.text-sm', 'div.font-bold'
      ];
      document.querySelectorAll(selectors.join(',')).forEach(el => translateTextNode(el, map));
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };


  const localizeListedPanel = () => {
    const map = {
      // セクションタイトル・見出し
      "About Listed": "Listedについて",
      "What is Listed?": "Listedとは？",
      "Get Started": "始め方",

      // 説明文
      "Listed is a free blogging platform that allows you to create a public journal published directly from your notes.":
        "Listedは、ノートから直接公開日記を作成できる無料のブログプラットフォームです。",
      "Create a free Listed author account to get started.":
        "無料のListed作成者アカウントを作成して始めましょう。",

      // ボタン・リンク
      "Learn more": "詳細を見る",
      "Create new author": "新しい作成者アカウントを作成"
    };

    const translate = () => {
      const selectors = [
        'h2', 'h4', 'p', 'a', 'button'
      ];
      document.querySelectorAll(selectors.join(',')).forEach(el => translateTextNode(el, map));
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };


  const localizeHelpAndFeedbackPanel = () => {
    const map = {
      // セクション見出し
      "Frequently asked questions": "よくある質問",
      "Community forum": "コミュニティフォーラム",
      "Community groups": "コミュニティグループ",
      "Account related issue?": "アカウントに関する問題？",

      // 質問タイトル
      "Who can read my private notes?": "自分のプライベートノートを読めるのは誰ですか？",
      "Can I collaborate with others on a note?": "他人とノートを共同編集できますか？",
      "Can I use Standard Notes totally offline?": "Standard Notesを完全にオフラインで使えますか？",
      "Can’t find your question here?": "ここにない質問がありますか？",

      // 説明文
      "Quite simply: no one but you. Not us, not your ISP, not a hacker, and not a government agency. As long as you keep your password safe, and your password is reasonably strong, then you are the only person in the world with the ability to decrypt your notes. For more on how we handle your privacy and security, check out our easy to read":
        "簡単に言えば、あなた以外の誰も読むことはできません。私たちも、あなたのISPも、ハッカーも、政府機関も含みません。パスワードを安全に保ち、十分に強固なものであれば、ノートを復号できるのは世界であなただけです。プライバシーとセキュリティに関する詳細は、読みやすいこちらをご覧ください：",

      "Because of our encrypted architecture, Standard Notes does not currently provide a real-time collaboration solution. Multiple users can share the same account however, but editing at the same time may result in sync conflicts, which may result in the duplication of notes.":
        "当サービスの暗号化アーキテクチャにより、現在リアルタイムでの共同編集には対応していません。ただし、同じアカウントを複数人で共有することは可能ですが、同時編集すると同期競合が発生し、ノートが重複する可能性があります。",

      "Standard Notes can be used totally offline without an account, and without an internet connection. You can find":
        "Standard Notesはアカウントなし・インターネット接続なしでも完全にオフラインで使用できます。詳しくは",

      "If you have an issue, found a bug or want to suggest a feature, you can browse or post to the forum. It’s recommended for non-account related issues.":
        "問題の報告やバグの発見、機能の提案などがある場合は、フォーラムを閲覧または投稿してください。アカウントに関連しない内容に推奨されます。",

      "Want to meet other passionate note-takers and privacy enthusiasts? Want to share your feedback with us? Join the Standard Notes Discord for discussions on security, themes, editors and more.":
        "他の熱心なノート愛用者やプライバシーに関心のある人と交流したいですか？フィードバックを共有したいですか？セキュリティ、テーマ、エディタなどについて議論するためにDiscordコミュニティに参加しましょう。",

      "Send an email to help@standardnotes.com and we’ll sort it out.":
        "help@standardnotes.com にメールを送ってください。私たちが対応いたします。",

      // ボタンやリンク
      "Learn more": "詳細を見る",
      "more details here.": "こちらをご覧ください。",
      "Open FAQ": "FAQを開く",
      "Go to the forum": "フォーラムへ移動",
      "Join our Discord": "Discordに参加する",
      "Email us": "メールを送る"
    };

    const translate = () => {
      const selectors = [
        'h2', 'h4', 'p', 'a', 'button'
      ];
      document.querySelectorAll(selectors.join(',')).forEach(el => translateTextNode(el, map));
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  const localizeTagContextMenu = () => {
    const map = {
      "Name": "名前",
      "Save tag name": "タグ名を保存",
      "Icon": "アイコン",
      "Emoji": "絵文字",
      "Reset": "リセット",
      "Favorite": "お気に入り",
      "Unfavorite": "お気に入りから外す",
      "Add subtag": "サブタグを追加",
      "Delete": "削除",
      "Last modified:": "最終更新：",
      "Created:": "作成日：",
      "Tag ID:": "タグID：",
      "Use your keyboard to enter or paste in an emoji character.": "キーボードで絵文字を入力または貼り付けてください。",
      "On Windows: Windows key + . to bring up emoji picker.": "Windowsでは、Windowsキー + . で絵文字ピッカーを表示できます。"
    };

    const translate = () => {
      document.querySelectorAll('[data-popover]').forEach(popover => {
        // テキストノード翻訳
        translateTextNode(popover, map);

        // aria-label の翻訳（例: Save tag name ボタンなど）
        popover.querySelectorAll('[aria-label]').forEach(el => {
          const label = el.getAttribute('aria-label');
          if (map[label]) el.setAttribute('aria-label', map[label]);
        });

        // button 内の span やテキスト部分（例: Delete ボタンのラベル）
        popover.querySelectorAll('button span').forEach(span => {
          const text = span.textContent.trim();
          if (map[text]) span.textContent = map[text];
        });
      });
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  };

  // --- 単位、曜日、月の辞書 ---
  const enToJaUnits = {
    'words': '単語',
    'characters': '文字',
    'paragraphs': '段落',
  };
  const enToJaWeek = {
    'Sun': '日', 'Mon': '月', 'Tue': '火', 'Wed': '水', 'Thu': '木', 'Fri': '金', 'Sat': '土',
  };
  const enToNumMonth = {
    'Jan': '1', 'Feb': '2', 'Mar': '3', 'Apr': '4', 'May': '5', 'Jun': '6',
    'Jul': '7', 'Aug': '8', 'Sep': '9', 'Oct': '10', 'Nov': '11', 'Dec': '12',
    '1月':'1', '2月':'2', '3月':'3', '4月':'4', '5月':'5', '6月':'6', '7月':'7', '8月':'8', '9月':'9', '10月':'10', '11月':'11', '12月':'12',
  };
  const jaWeekShort = { '日':'日', '月':'月', '火':'火', '水':'水', '木':'木', '金':'金', '土':'土' };

  // --- 1: words/characters/paragraphs行の徹底日本語化 ---
  function localizeStatsLine() {
    const translate = () => {
      document.querySelectorAll('.select-text .mb-1, .select-text > div').forEach(div => {
        // [A] まずstatsっぽい行だけ
        if (!div.textContent.match(/\b(words?|characters?|paragraphs?)\b/)) return;

        // [B] ノードを全て走査して内容合成
        let buffer = '';
        div.childNodes.forEach(node => {
          buffer += node.nodeType === Node.TEXT_NODE ? node.nodeValue : node.textContent;
        });

        // [C] 「数字+単位」を抽出して日本語化
        let jaLine = buffer
          .split(/[\u00b7·,・]/)
          .map(part => {
            const m = part.trim().match(/^(\d+)\s*(words?|characters?|paragraphs?)$/);
            if (m) {
              const num = m[1], unit = m[2];
              return `${num}${enToJaUnits[unit] ?? unit}`;
            }
            return part.trim();
          })
          .join('・');

        // [D] 表示が異なる場合のみ上書き
        if (div.textContent.trim() !== jaLine) {
          div.innerHTML = jaLine;
        }
      });
    };
    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  }

  // --- 2: 日付・時刻などfooterの日本語化 ---
  function localizeNoteFooterInfoExtra() {
    function translateTextNodeContent(node) {
      let text = node.nodeValue;
      // 時間系
      text = text.replace(/<\s*(\d+)\s*(seconds?|minutes?|hours?|days?|weeks?)/g, (m, num, unit) => {
        const dict = {
          second: '秒', seconds: '秒',
          minute: '分', minutes: '分',
          hour: '時間', hours: '時間',
          day: '日', days: '日',
          week: '週間', weeks: '週間',
        };
        return `< ${num}${dict[unit] || unit}`;
      });
      text = text.replace(/(\d+)\s*(seconds?|minutes?|hours?|days?|weeks?)/g, (m, num, unit) => {
        const dict = {
          second: '秒', seconds: '秒',
          minute: '分', minutes: '分',
          hour: '時間', hours: '時間',
          day: '日', days: '日',
          week: '週間', weeks: '週間',
        };
        return `${num}${dict[unit] || unit}`;
      });
      text = text.replace(/less than a minute/i, "1分未満");
      node.nodeValue = text;
    }

    function convertDateFormat(str) {
      // ex: "Fri May 30 2025 14:01:45" や "金 5月 30 2025 14:01:45"
      const dateRegex = /\b(?<wday>(Sun|Mon|Tue|Wed|Thu|Fri|Sat|日|月|火|水|木|金|土))\b\s+(?<month>(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]+月))\s+(?<day>\d{1,2})\s+(?<year>\d{4})/;
      const match = str.match(dateRegex);
      if (match && match.groups) {
        const { wday, month, day, year } = match.groups;
        let jaWday = enToJaWeek[wday] || jaWeekShort[wday] || wday;
        let numMonth = enToNumMonth[month] || month.replace('月','');
        let numDay = day;
        let jaDate = `${year}/${numMonth}/${numDay} (${jaWday})`;
        // 後ろに時刻もあれば追加
        let timeMatch = str.match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/);
        if (timeMatch) jaDate += ' ' + timeMatch[0];
        return jaDate;
      }
      return str;
    }

    const translate = () => {
      document.querySelectorAll('.select-text .mb-1, .select-text > div').forEach(div => {
        // [1] stats lineはlocalizeStatsLineでやるのでスキップ
        if (div.textContent.match(/\b(words?|characters?|paragraphs?)\b/)) return;
        div.childNodes.forEach(child => {
          if (child.nodeType === Node.TEXT_NODE) {
            translateTextNodeContent(child);
            let newText = convertDateFormat(child.nodeValue);
            if (child.nodeValue !== newText) child.nodeValue = newText;
          }
          if (child.nodeType === Node.ELEMENT_NODE) {
            child.childNodes.forEach(grandchild => {
              if (grandchild.nodeType === Node.TEXT_NODE) {
                translateTextNodeContent(grandchild);
                let newText = convertDateFormat(grandchild.nodeValue);
                if (grandchild.nodeValue !== newText) grandchild.nodeValue = newText;
              }
            });
          }
        });
      });
    };
    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  }

  function localizeLinkPopover() {
    const map = {
      "Search items to link...": "リンクする項目を検索...",
      "Linked Files": "リンク済みファイル",
      "Linked Tags": "リンク済みタグ",
      "Upload and link file(s)": "ファイルをアップロードしてリンク",
      "Unlinked": "未リンク",
      "Linked": "リンク済み",
      "Create & add tag": "タグを作成して追加",
    };

    const translate = () => {
      // 1. ポップオーバー内だけを確実に抽出
      document.querySelectorAll('[data-popover]').forEach(popover => {
        // placeholder属性
        popover.querySelectorAll('input[placeholder]').forEach(input => {
          const p = input.placeholder.trim();
          if (map[p]) input.placeholder = map[p];
        });
        // テキストノード
        popover.querySelectorAll('div, button, span, label').forEach(el => {
          el.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
              const raw = child.nodeValue.trim();
              if (map[raw]) child.nodeValue = map[raw];
            }
          });
        });
        // aria-label属性
        popover.querySelectorAll('[aria-label]').forEach(el => {
          const label = el.getAttribute('aria-label');
          if (map[label]) el.setAttribute('aria-label', map[label]);
        });
      });
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  }

  function localizeEditorTitleBar() {
    const map = {
      "Link tags, notes, files...": "タグ・ノート・ファイルをリンク...",
      "Link tags, notes or files": "タグ・ノート・ファイルをリンク",
      "Create & add tag": "タグを作成して追加",
    };

    // .note-view-linking-container配下 で “特定span”以外
    const translate = () => {
      // エディタ上部バー
      const titleBar = document.querySelector('#editor-title-bar');
      if (titleBar) {
        titleBar.querySelectorAll('input[placeholder]').forEach(input => {
          const p = input.placeholder.trim();
          if (map[p]) input.placeholder = map[p];
        });
        titleBar.querySelectorAll('label, [aria-label], [title]').forEach(el => {
          if (el.hasAttribute('aria-label')) {
            const label = el.getAttribute('aria-label');
            if (map[label]) el.setAttribute('aria-label', map[label]);
          }
          if (el.hasAttribute('title')) {
            const t = el.getAttribute('title');
            if (map[t]) el.setAttribute('title', map[t]);
          }
          el.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
              const raw = child.nodeValue.trim();
              if (map[raw]) child.nodeValue = map[raw];
            }
          });
        });
      }

      // note-view-linking-container 限定
      document.querySelectorAll('.note-view-linking-container').forEach(container => {
        // 除外：inline-flex.bg-contrast.text-text配下のspan
        const exclusionSpans = Array.from(container.querySelectorAll(
          '.inline-flex.bg-contrast.text-text span'
        ));

        // input placeholder
        container.querySelectorAll('input[placeholder]').forEach(input => {
          const p = input.placeholder.trim();
          if (map[p]) input.placeholder = map[p];
        });

        // ボタンやspan等、除外spanは“スキップ”
        container.querySelectorAll('button, span, label, [aria-label], [title]').forEach(el => {
          // 除外spanは無視
          if (exclusionSpans.includes(el)) return;
          if (el.hasAttribute('aria-label')) {
            const label = el.getAttribute('aria-label');
            if (map[label]) el.setAttribute('aria-label', map[label]);
          }
          if (el.hasAttribute('title')) {
            const t = el.getAttribute('title');
            if (map[t]) el.setAttribute('title', map[t]);
          }
          el.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
              const raw = child.nodeValue.trim();
              if (map[raw]) child.nodeValue = map[raw];
            }
          });
        });
      });
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  }

  function localizeMoveToTrashModal() {
    const map = {
      "Move to Trash": "ゴミ箱に移動",
      "Are you sure you want to move": "本当に移動しますか？",
      "to the trash?": "をゴミ箱に移動してもよろしいですか？",
      "Cancel": "キャンセル",
      "Confirm": "確認",
    };

    const translate = () => {
      document.querySelectorAll('.sk-modal-content').forEach(modal => {
        // タイトル
        modal.querySelectorAll('.font-bold.text-lg').forEach(el => {
          // "Move to Trash"だけをピンポイント
          if (el.textContent.trim() === "Move to Trash") {
            el.textContent = map["Move to Trash"];
          }
        });

        // 質問文
        modal.querySelectorAll('.sk-p').forEach(p => {
          // ex: Are you sure you want to move 'test' to the trash?
          const raw = p.textContent.trim();
          const m = raw.match(/^Are you sure you want to move ['‘’「」](.+)['‘’「」] to the trash\?$/)
                || raw.match(/^Are you sure you want to move (.+) to the trash\?$/);
          if (m) {
            // ノート名を残す
            p.textContent = `「${m[1]}」${map["to the trash?"]}`;
          }
        });

        // ボタン
        modal.querySelectorAll('.sk-label').forEach(div => {
          const raw = div.textContent.trim();
          if (map[raw]) div.textContent = map[raw];
        });
      });
    };

    new MutationObserver(translate).observe(document.body, { childList: true, subtree: true });
    translate();
  }

  function localizeItemsListTitle() {
    const map = {
      "Starred": "お気に入り",
      "Archived": "アーカイブ",
      "Trash": "ゴミ箱",
      "Untagged": "タグなし",
      "Files": "ファイル",
      "Notes": "ノート一覧"
    };

  function translate() {
    // .section-title-bar-header配下だけに限定
    document.querySelectorAll(
      '.section-title-bar-header .text-2xl.font-semibold.text-text, .section-title-bar-header .md\\:text-lg.font-semibold.text-text'
    ).forEach(el => {
      const raw = el.textContent.trim();
      if (map[raw]) el.textContent = map[raw];
    });
  }

    // より確実に反応させるためのオブザーバ設定
    const observer = new MutationObserver((mutations) => {
      let shouldTranslate = false;
      mutations.forEach(mutation => {
        // テキストやノードの追加/変更時のみ反応
        if (
          mutation.type === "childList" ||
          mutation.type === "characterData" ||
          mutation.type === "subtree"
        ) {
          shouldTranslate = true;
        }
      });
      if (shouldTranslate) {
        setTimeout(translate, 0); // Reactの再描画後に実行
      }
    });

    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true
    });

    translate();
  }

  // メイン監視（フォントとEnter制御）
  new MutationObserver(() => {
    applyEditorStyle();
    setupTitleField();
  }).observe(document.body, { childList: true, subtree: true });

  // 日本語化処理呼び出し
  localizeDisplayOptions();
  localizeSidebarViews();
  localizeTagsSection();
  localizeSearchBoxes();
  localizeSearchMessages();
  localizeFilterButtons();
  localizeNoteOptionsMenu();
  localizeNoteFooterInfo();
  localizeChallengeModal();
  localizeAccountMenu();
  localizeQuickSettingsMenu();
  localizePreferencesMenu();
  localizePreferencesPanels();
  localizeSecurityAndPrivacySettings();
  localizeBackupSettings();
  localizeAppearanceAndEditorSettings();
  localizeAccountPreferencesPanel();
  localizeListedPanel();
  localizeHelpAndFeedbackPanel();
  localizeTagContextMenu();
  localizeStatsLine();
  localizeNoteFooterInfoExtra();
  localizeLinkPopover();
  localizeEditorTitleBar();
  localizeMoveToTrashModal();
  localizeItemsListTitle();
})();
