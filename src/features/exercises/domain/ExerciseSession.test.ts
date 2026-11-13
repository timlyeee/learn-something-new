import { describe, expect, it } from "vitest";
import { ExerciseSession } from "./ExerciseSession";

describe("答题会话", () => {
  it("未作答不能推进，同一题只能接受一次作答", () => {
    const session = new ExerciseSession<string, string>(["甲", "乙"]);
    expect(session.next()).toBeNull();
    expect(session.snapshot.current).toBe("甲");
    expect(session.answer({ correct: true, response: "选项一" })).toBe(true);
    expect(session.answer({ correct: false, response: "选项二" })).toBe(false);
    expect(session.snapshot.score).toBe(1);
    expect(session.snapshot.mistakes).toEqual([]);
    expect(session.snapshot.answer?.response).toBe("选项一");
    session.next();
    expect(session.snapshot.current).toBe("乙");
    expect(session.snapshot.answer).toBeNull();
  });

  it("正式轮次只在最终推进时返回一次成绩", () => {
    const session = new ExerciseSession<string, null>(["甲", "乙"]);
    session.answer({ correct: false, response: null });
    expect(session.next()).toBeNull();
    expect(session.snapshot.mistakes).toEqual(["甲"]);
    session.answer({ correct: true, response: null });
    expect(session.next()).toEqual({ correct: 1, total: 2, stars: 0 });
    expect(session.snapshot.done).toBe(true);
    expect(session.next()).toBeNull();
    expect(session.answer({ correct: true, response: null })).toBe(false);
    expect(session.snapshot.score).toBe(1);
  });

  it("错题轮次只包含错题，支持再次复习，且不产生正式成绩", () => {
    const session = new ExerciseSession<string, null>(["甲", "乙"]);
    session.answer({ correct: false, response: null });
    session.next();
    session.answer({ correct: true, response: null });
    session.next();
    session.reviewMistakes();
    expect(session.snapshot).toMatchObject({
      questions: ["甲"],
      index: 0,
      score: 0,
      mistakes: [],
      done: false,
      practice: true,
      answer: null,
    });
    session.answer({ correct: false, response: null });
    expect(session.next()).toBeNull();
    expect(session.snapshot.done).toBe(true);
    session.reviewMistakes();
    session.answer({ correct: true, response: null });
    expect(session.next()).toBeNull();
    expect(session.snapshot.result).toEqual({ correct: 1, total: 1, stars: 3 });
  });

  it("重新挑战更换题组并复位所有轮次状态，允许记录新正式成绩", () => {
    const session = new ExerciseSession<string, null>(["旧题"]);
    session.answer({ correct: false, response: null });
    session.next();
    session.reviewMistakes();
    session.answer({ correct: true, response: null });
    session.next();
    session.restart(["新题"]);
    expect(session.snapshot).toMatchObject({
      questions: ["新题"],
      current: "新题",
      index: 0,
      answer: null,
      score: 0,
      mistakes: [],
      done: false,
      practice: false,
      result: { correct: 0, total: 1, stars: 0 },
    });
    session.answer({ correct: true, response: null });
    expect(session.next()).toEqual({ correct: 1, total: 1, stars: 3 });
    expect(session.next()).toBeNull();
  });

  it("只接受非空题组，无错题或未完成时不能进入错题轮次", () => {
    expect(() => new ExerciseSession([])).toThrow("至少需要一道题目");
    const session = new ExerciseSession<string, null>(["甲", "乙"]);
    session.answer({ correct: false, response: null });
    session.reviewMistakes();
    expect(session.snapshot.practice).toBe(false);
    session.restart(["新题"]);
    session.answer({ correct: true, response: null });
    session.next();
    const completed = session.snapshot;
    session.reviewMistakes();
    expect(session.snapshot).toBe(completed);
    expect(() => session.restart([])).toThrow("至少需要一道题目");
    expect(session.snapshot).toBe(completed);
  });

  it.each(["普通选择", "手写自评", "配对完成"])(
    "%s 的题目和回显无需被会话解析",
    (kind) => {
      const question = { kind, section: { title: "练习部分" } };
      const response = { source: kind, value: [1, 2] };
      const session = new ExerciseSession<typeof question, typeof response>([
        question,
      ]);
      session.answer({ correct: true, response });
      expect(session.snapshot.current).toEqual(question);
      expect(session.snapshot.answer?.response).toEqual(response);
      expect(session.next()).toEqual({ correct: 1, total: 1, stars: 3 });
    },
  );
});
