# Pixel Quiz Quest

這是一個 2000 年代街機像素風格的網頁問答遊戲。前端使用 React + Vite 打造，後端與資料庫則完全依賴 Google Sheets 與 Google Apps Script (GAS)。

## 1. 前端環境安裝與啟動

1. 確保電腦已安裝 [Node.js](https://nodejs.org/)。
2. 開啟終端機，進入專案資料夾：
   ```bash
   cd c:\Users\liuc7\Vibe\Pixel-Game
   ```
3. 安裝依賴套件（如果你還沒安裝過）：
   ```bash
   npm install
   ```
4. 啟動開發伺服器：
   ```bash
   npm run dev
   ```
5. 打開瀏覽器 (預設通常為 `http://localhost:5173`) 即可看到遊戲畫面。

## 2. Google Sheets 資料庫建置

1. 建立一個新的 [Google 試算表](https://sheets.new/)。
2. 在左下角建立兩個工作表，分別精準命名為：
   - **題目**
   - **回答**
3. 在 **「題目」** 工作表的第一列輸入以下標題：
   - A1: `題號`
   - B1: `題目`
   - C1: `A`
   - D1: `B`
   - E1: `C`
   - F1: `D`
   - G1: `解答`
4. 在 **「回答」** 工作表的第一列輸入以下標題：
   - A1: `ID`
   - B1: `闖關次數`
   - C1: `總分`
   - D1: `最高分`
   - E1: `第一次通關分數`
   - F1: `花了幾次通關`
   - G1: `最近遊玩時間`

## 3. Google Apps Script 連線設定

1. 在剛建好的 Google 試算表中，點擊上方選單的 **「擴充功能」 > 「Apps Script」**。
2. 系統會開啟一個新的程式碼編輯器。請將編輯器原本的程式碼清空。
3. 把專案資料夾中的 `GoogleAppsScript.js` 檔案內容全部複製，貼上到 Apps Script 編輯器中，並點擊「儲存」圖示 (或按 Ctrl+S)。
4. 點擊右上角的 **「部署」 > 「新增部署作業」**。
5. 點選「選取類型」旁邊的齒輪 ⚙️，選擇 **「網頁應用程式」**。
   - **說明**：隨意填寫（例如：v1）。
   - **執行身分**：選擇 **我 (你的信箱)**。
   - **誰可以存取**：選擇 **所有人**。
6. 點擊 **「部署」**。如果是第一次部署，系統會要求「授權存取」，請登入你的 Google 帳號並點擊「顯示進階設定」以「前往專案(不安全)」，最後點擊「允許」。
7. 部署完成後，複製 **網頁應用程式網址 (Web App URL)**。
8. 將這串網址貼到專案資料夾中的 `.env` 檔案內，對應給 `VITE_GOOGLE_APP_SCRIPT_URL`：
   ```env
   VITE_GOOGLE_APP_SCRIPT_URL="https://script.google.com/macros/s/你的專屬ID/exec"
   VITE_PASS_THRESHOLD=3
   VITE_QUESTION_COUNT=5
   ```

## 4. 測試題庫（生成式 AI 基礎知識）

你可以直接將下方表格 **複製**，然後在 Google Sheet 的 **「題目」** 工作表第二列第一欄（A2）點擊「貼上」，就能直接整批匯入！

| 題號 | 題目 | A | B | C | D | 解答 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 什麼是「生成式 AI」的主要功能？ | 將圖片壓縮變小 | 創造新的文字、圖片或音訊內容 | 計算數學方程式的精確解 | 修復硬體設備的故障 | B |
| 2 | 以下哪一個是知名的大型語言模型（LLM）？ | Photoshop | Windows 11 | GPT-4 | Microsoft Excel | C |
| 3 | 在給 AI 下指令時，我們輸入的文字通常被稱為什麼？ | 密碼 (Password) | 腳本 (Script) | 提示詞 (Prompt) | 程式碼 (Code) | C |
| 4 | 「幻覺 (Hallucination)」在生成式 AI 中指的是什麼現象？ | 電腦螢幕閃爍 | AI 生成了看似合理但事實上錯誤的資訊 | AI 拒絕回答所有問題 | 網路斷線導致無法連線 | B |
| 5 | Midjourney 或 Stable Diffusion 主要是用來生成什麼？ | 程式碼 | 試算表 | 影片字幕 | 圖片圖像 | D |
| 6 | 大型語言模型主要透過什麼方式學習語言？ | 由工程師手動輸入字典 | 透過大量文本資料進行預訓練 | 連接維基百科即時查詢 | 學習多種基礎程式語言 | B |
| 7 | 下列哪一種做法能有效提升 AI 回答的準確度？ | 給予明確、具體且包含背景知識的提示詞 | 只給一個單字作為指令 | 設定 AI 的字體顏色 | 重新開機 | A |
| 8 | 生成式 AI 目前在版權與倫理上最大的爭議點為何？ | 消耗太多電力 | 回答速度太慢 | 訓練資料可能包含受版權保護的作品 | 產生的檔案太大 | C |
| 9 | 什麼是 Token 在語言模型中的基本意義？ | 購買 AI 服務的代幣 | 模型處理文字的最小切分單位 | 使用者的帳號密碼 | 輸出的速度單位 | B |
| 10 | ChatGPT 主要是基於什麼架構開發的？ | 卷積神經網絡 (CNN) | 遞迴神經網絡 (RNN) | 決策樹 (Decision Tree) | 轉換器架構 (Transformer) | D |

## 5. 自動部署到 GitHub Pages

專案內已經有配置好 GitHub Actions（在 `.github/workflows/deploy.yml`）。只要將程式碼推上 GitHub `main` 分支就能自動打包並發佈到 GitHub Pages。

### ★ 重要變數設定 (GitHub Secrets / Variables)

因為環境變數不能直接放在代碼中，請到你的 GitHub 儲存庫：
1. 依序點擊 **Settings** > **Secrets and variables** > **Actions**。
2. 點擊 **New repository secret**：
   - Name: `VITE_GOOGLE_APP_SCRIPT_URL`
   - Secret: `你的 GAS 部署網址（例如：https://script.google.com/.../exec）`
3. 切換到旁邊的 **Variables** 頁籤，點擊 **New repository variable** (非機密可以存這裡，不加也可以，腳本有預設值)：
   - Name: `VITE_PASS_THRESHOLD` / Value: `3`
   - Name: `VITE_QUESTION_COUNT` / Value: `5`

### ★ 開啟 GitHub Pages 功能
1. 回到 **Settings** > **Pages**。
2. 在 **Build and deployment** > Source 之下選擇 **GitHub Actions**。
3. 只要把代碼 push 進 `main` 分支，GitHub 就會自動執行測試、打包，並上架你的遊戲！
