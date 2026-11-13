# 卡片与题目生成

> 状态：已完成

## 背景

用户反馈课程题量过少（每课仅 1 题），要求「先定卡片格式，再由卡片内容动态生成题目，不固定题量」；同时新增 AI 卡片生成流程，补充更详细的提示规则，生成更贴合学习场景的题目。

## 现状（改造前）

- `Course`（`src/types.ts`）只有 `question/options/answer` 一道题，6 门课共 6 题，答题流在 `Courses.tsx` 内联渲染。
- 没有 AI 卡片生成流程；`src/lib/prompt.ts` 只有 AI 对话的教师提示词。

## 设计

### 卡片类型

`Card` 在 `src/types.ts`：`kind`（`word` / `grammar` / `dialogue`）、`front`（正面作答对象）、`back`（背面答案或释义），可选 `reading`、`example`、`exampleMeaning`、`note`。卡片是课程与练习的统一内容单元。

### 动态出题

`src/lib/quiz.ts` 新增 `questionsFromCards(cards)`：按卡片字段丰富度动态推导题目——有 `reading` 出读音题、有 `back` 出释义题、有 `example` 出选词/选句题；干扰项从同批卡片的字段中抽取，保证 4 个不重复选项、唯一正确答案。字段多题就多、少题就少。

`Course.cards` 替换原 `question/options/answer`；`Courses.tsx` 用 `questionsFromCards(course.cards)` 生成答题流（复用 `QuizSession`）。

### 作答反馈

普通卡片与假名练习通过 `useExerciseSession` 共用答题会话生命周期，计分、题目推进、错题轮次及正确音效统一处理，详见 [答题会话生命周期](007-exercise-session.md)。

- 课程练习与假名练习共用答对提示音：在用户确认正确答案时播放一段短促、低音量的合成和弦，不依赖外部音频文件或网络。
- 提示音默认开启，答题页顶部提供可访问的开关，并将偏好保存到本机；关闭后所有题型都保持静音。
- 声音只作为辅助反馈，正确状态仍同时显示颜色、文字和答案解释；音频初始化失败时不影响计分与继续答题。
- 主按钮、次按钮、答案选项、配对按钮和关卡入口都提供即时下压反馈，不通过改变布局来制造按压效果。

### AI 生成卡片

- `src/lib/prompt.ts` 新增 `cardPrompt(topic)`：要求 AI 输出严格 JSON 数组，限定 kind/字段/难度/罗马音/例句等规则。
- `src/lib/cards.ts` 新增 `parseCardItem(item, id)` 与 `parseCards(raw)`：解析并校验 AI 输出为 `Card[]`。
- `src/lib/api.ts` 新增 `requestCards()`：网页走 `/api/cards`，Android 原生直连 HTTPS。
- `server/app.ts` 新增 `POST /api/cards`，校验与上游调用复用 `/api/chat` 模式。
- `src/lib/courses.ts` 新增 `parseCourses(value)`；内置课程卡片从 `content.ts` 迁出到 `src/data/courses.json`，由 `content.ts` 导入解析。
- `src/lib/savedCards.ts` 新增 `SavedCardSet` 本地持久化（localStorage `learnnew-cards`）。
- `Chat.tsx` 增加「生成卡片」模式：输入主题 → 生成卡片 → 保存为卡片集或直接用同一出题管线练习，已保存卡片集可反复练习/删除。

## 非目标

- 内置课程仍随前端打包，不引入服务端动态下发（离线可用优先）。
- 不引入卡片审核、去重、社区。

## 验证

- `npm run check`、`npm test`（新增 cards/quiz 用例）、`npm run build`。
