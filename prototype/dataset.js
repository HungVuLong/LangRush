window.LR = window.LR || {};

/* We use a JS file assigning to a global instead of a raw dataset.json 
   to avoid CORS issues when opening index.html via file:// protocol. 
   This contains 18 IT Japanese vocabulary items. */

LR.dataset = {
  easy: [
    { id: 'e1', vocab: 'サーバー', prompt: 'Translate the word: 「サーバー」', options: ['Client', 'Server', 'Network', 'Database'], correct: 1 },
    { id: 'e2', vocab: 'データベース', prompt: 'Translate the word: 「データベース」', options: ['Database', 'Data Center', 'Dashboard', 'Bandwidth'], correct: 0 },
    { id: 'e3', vocab: 'バグ', prompt: 'Translate the word: 「バグ」', options: ['Feature', 'Bug', 'Log', 'Tag'], correct: 1 },
    { id: 'e4', vocab: 'アカウント', prompt: 'Translate the word: 「アカウント」', options: ['Access', 'Account', 'Amount', 'Admin'], correct: 1 },
    { id: 'e5', vocab: 'パスワード', prompt: 'Translate the word: 「パスワード」', options: ['Password', 'Passcode', 'Passport', 'Pattern'], correct: 0 },
    { id: 'e6', vocab: 'ログイン', prompt: 'Translate the word: 「ログイン」', options: ['Logout', 'Logfile', 'Login', 'Loading'], correct: 2 }
  ],
  medium: [
    { id: 'm1', vocab: 'クラウド', prompt: 'Identify the word for this image:', image: '☁️', options: ['クラウド', 'サーバー', 'ルーター', 'コード'], correct: 0 },
    { id: 'm2', vocab: 'メール', prompt: 'Identify the word for this image:', image: '✉️', options: ['ファイル', 'メール', 'フォルダー', 'リンク'], correct: 1 },
    { id: 'm3', vocab: 'セキュリティ', prompt: 'Identify the word for this image:', image: '🔒', options: ['バグ', 'セキュリティ', 'エラー', 'キー'], correct: 1 },
    { id: 'm4', vocab: '設定', prompt: 'Identify the word for this image:', image: '⚙️', options: ['設定', '保存', '削除', '更新'], correct: 0 },
    { id: 'm5', vocab: '検索', prompt: 'Identify the word for this image:', image: '🔍', options: ['入力', '出力', '検索', '表示'], correct: 2 },
    { id: 'm6', vocab: '警告', prompt: 'Identify the word for this image:', image: '⚠️', options: ['成功', '警告', '失敗', '情報'], correct: 1 }
  ],
  hard: [
    { id: 'h1', vocab: 'サーバーがダウンしています', prompt: 'Translate: 「サーバーがダウンしています。」', options: ['The server is starting.', 'The server is down.', 'The server is slow.', 'The server is updated.'], correct: 1 },
    { id: 'h2', vocab: 'このコードをコミットしてください', prompt: 'Translate: 「このコードをコミットしてください。」', options: ['Please delete this code.', 'Please review this code.', 'Please commit this code.', 'Please run this code.'], correct: 2 },
    { id: 'h3', vocab: 'エラーが発生しました', prompt: 'Translate: 「エラーが発生しました。」', options: ['An error has occurred.', 'The error was fixed.', 'Please check the error.', 'Ignore the error.'], correct: 0 },
    { id: 'h4', vocab: 'データをバックアップする', prompt: 'Translate: 「データをバックアップする」', options: ['Restore the data', 'Delete the data', 'Backup the data', 'Send the data'], correct: 2 },
    { id: 'h5', vocab: 'デプロイが完了しました', prompt: 'Translate: 「デプロイが完了しました。」', options: ['Deployment is starting.', 'Deployment failed.', 'Deployment is complete.', 'Deployment was cancelled.'], correct: 2 },
    { id: 'h6', vocab: 'パスワードを再設定してください', prompt: 'Translate: 「パスワードを再設定してください。」', options: ['Please enter your password.', 'Please reset your password.', 'Please save your password.', 'Please share your password.'], correct: 1 }
  ]
};
