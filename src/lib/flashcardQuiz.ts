import type { FlashcardItem } from '../types/flashcard'

export type FlashcardQuizMode = 'ja-vi' | 'vi-ja'

/** Định dạng câu hỏi trong một phiên quiz */
export type QuizQuestionFormat = 'mcq' | 'keyboard' | 'truefalse'

export type QuizSessionFormats = {
  mcq: boolean
  keyboard: boolean
  truefalse: boolean
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

/** Nhãn hiển thị trên nút đáp án MCQ / tham chiếu khi chấm gõ phím (vi-ja). */
export function quizOptionLabel(card: FlashcardItem, mode: FlashcardQuizMode): string {
  if (mode === 'ja-vi') {
    return card.meaning.trim()
  }
  const k = card.kanji.trim()
  const r = card.reading?.trim()
  return r ? `${k} · ${r}` : k
}

/** Dòng hiển thị tiếng Nhật (câu hỏi phía Nhật). */
export function quizJaPromptLines(card: FlashcardItem): { main: string; reading?: string } {
  const main = card.kanji.trim()
  const reading = card.reading?.trim()
  return reading ? { main, reading } : { main }
}

function pickDistractorCards(
  correct: FlashcardItem,
  all: FlashcardItem[],
  mode: FlashcardQuizMode,
  maxWrong: number,
): FlashcardItem[] {
  const correctLabel = quizOptionLabel(correct, mode)
  const used = new Set<string>([correctLabel])
  const others = shuffleInPlace(all.filter((c) => c.id !== correct.id))
  const out: FlashcardItem[] = []
  for (const c of others) {
    if (out.length >= maxWrong) break
    const lab = quizOptionLabel(c, mode)
    if (used.has(lab)) continue
    used.add(lab)
    out.push(c)
  }
  return out
}

const TARGET_OPTION_COUNT = 4

export type QuizMcqItem = {
  format: 'mcq'
  mode: FlashcardQuizMode
  target: FlashcardItem
  choices: FlashcardItem[]
}

export type QuizKeyboardItem = {
  format: 'keyboard'
  mode: FlashcardQuizMode
  target: FlashcardItem
}

export type QuizTrueFalseItem = {
  format: 'truefalse'
  mode: FlashcardQuizMode
  target: FlashcardItem
  /** Nội dung ghép đôi hiển thị cho người dùng */
  showJa: string
  showVi: string
  /** Ghép đôi này có đúng với thẻ `target` không */
  statementTrue: boolean
}

export type QuizPlanItem = QuizMcqItem | QuizKeyboardItem | QuizTrueFalseItem

export function enabledFormatList(f: QuizSessionFormats): QuizQuestionFormat[] {
  const out: QuizQuestionFormat[] = []
  if (f.mcq) out.push('mcq')
  if (f.keyboard) out.push('keyboard')
  if (f.truefalse) out.push('truefalse')
  return out
}

/** Trắc nghiệm / đúng-sai cần ít nhất 2 thẻ để có nhiễu; chỉ gõ phím thì 1 thẻ cũng được. */
export function minCardsForQuizFormats(f: QuizSessionFormats): number {
  if (f.mcq || f.truefalse) return 2
  return 1
}

function pickWrongForTrueFalse(
  target: FlashcardItem,
  others: FlashcardItem[],
  mode: FlashcardQuizMode,
): FlashcardItem | null {
  const shuffled = shuffleInPlace([...others])
  for (const c of shuffled) {
    if (mode === 'ja-vi') {
      if (normalizeTyping(c.meaning) !== normalizeTyping(target.meaning)) return c
    } else {
      if (normalizeTyping(quizOptionLabel(c, 'vi-ja')) !== normalizeTyping(quizOptionLabel(target, 'vi-ja')))
        return c
    }
  }
  return null
}

function buildTrueFalseItem(target: FlashcardItem, all: FlashcardItem[], mode: FlashcardQuizMode): QuizTrueFalseItem {
  const others = all.filter((c) => c.id !== target.id)
  const wrong = pickWrongForTrueFalse(target, others, mode)
  const canFalse = wrong !== null
  const statementTrue = !canFalse || Math.random() < 0.5

  if (mode === 'ja-vi') {
    const { main, reading } = quizJaPromptLines(target)
    const showJa = reading ? `${main}\n${reading}` : main

    if (statementTrue) {
      return {
        format: 'truefalse',
        mode,
        target,
        showJa,
        showVi: target.meaning.trim(),
        statementTrue: true,
      }
    }
    return {
      format: 'truefalse',
      mode,
      target,
      showJa,
      showVi: wrong!.meaning.trim(),
      statementTrue: false,
    }
  }

  // vi-ja
  const meaning = target.meaning.trim()
  const showJaCorrect = quizOptionLabel(target, 'vi-ja')

  if (statementTrue) {
    return {
      format: 'truefalse',
      mode,
      target,
      showJa: showJaCorrect,
      showVi: meaning,
      statementTrue: true,
    }
  }
  return {
    format: 'truefalse',
    mode,
    target,
    showJa: quizOptionLabel(wrong!, 'vi-ja'),
    showVi: meaning,
    statementTrue: false,
  }
}

function buildMcqItem(target: FlashcardItem, all: FlashcardItem[], mode: FlashcardQuizMode): QuizMcqItem {
  const wrong = pickDistractorCards(target, all, mode, TARGET_OPTION_COUNT - 1)
  const choices = shuffleInPlace([target, ...wrong])
  return { format: 'mcq', mode, target, choices }
}

function buildKeyboardItem(target: FlashcardItem, mode: FlashcardQuizMode): QuizKeyboardItem {
  return { format: 'keyboard', mode, target }
}

function resolveFormatForCard(
  enabled: QuizQuestionFormat[],
  mixPerQuestion: boolean,
  fixed: QuizQuestionFormat,
): QuizQuestionFormat {
  if (enabled.length === 0) return 'mcq'
  if (enabled.length === 1) return enabled[0]!
  if (!mixPerQuestion) return fixed
  return enabled[Math.floor(Math.random() * enabled.length)]!
}

export type BuildQuizPlanParams = {
  cards: FlashcardItem[]
  mode: FlashcardQuizMode
  formats: QuizSessionFormats
  /** true = mỗi câu chọn ngẫu nhiên trong các format đã bật */
  mixFormatsPerQuestion: boolean
  /** Khi không mix và có nhiều format: dùng cố định */
  fixedFormat: QuizQuestionFormat
  /**
   * Số câu trong phiên (xáo thẻ rồi lấy từng đầu).
   * Mặc định = mọi thẻ. Luôn kẹp trong [1, cards.length].
   */
  questionCount?: number
}

export function buildQuizPlan(params: BuildQuizPlanParams): QuizPlanItem[] {
  const { cards, mode, formats, mixFormatsPerQuestion, fixedFormat, questionCount } = params
  const enabled = enabledFormatList(formats)
  if (enabled.length === 0) return []
  if (cards.length === 0) return []

  const maxN = cards.length
  const raw = questionCount ?? maxN
  const n = Math.max(1, Math.min(raw, maxN))

  const deck = shuffleInPlace([...cards]).slice(0, n)
  return deck.map((target) => {
    const fmt = resolveFormatForCard(enabled, mixFormatsPerQuestion, fixedFormat)
    if (fmt === 'mcq') return buildMcqItem(target, cards, mode)
    if (fmt === 'keyboard') return buildKeyboardItem(target, mode)
    return buildTrueFalseItem(target, cards, mode)
  })
}

/** Chuẩn hoá để so khớp gõ phím (NFKC, trim, gộp khoảng trắng, lowercase). */
export function normalizeTyping(s: string): string {
  return s
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

/** Loại bỏ dấu tiếng Việt để so khớp không dấu */
export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
}

/** Tính khoảng cách Levenshtein giữa 2 chuỗi */
export function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0]![j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1, // thay thế
          Math.min(
            matrix[i]![j - 1]! + 1, // chèn
            matrix[i - 1]![j]! + 1 // xoá
          )
        )
      }
    }
  }

  return matrix[b.length]![a.length]!
}

/** Tính tỉ lệ tương đồng Levenshtein (0.0 -> 1.0) */
export function getSimilarityRatio(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length)
  if (maxLength === 0) return 1.0
  const dist = getLevenshteinDistance(a, b)
  return 1.0 - dist / maxLength
}

/** Tách các từ trong ngoặc đơn để so khớp linh hoạt */
export function cleanParentheses(s: string): string[] {
  const stripped = s.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/\{[^}]*\}/g, '')
  const kept = s.replace(/[()\[\]{}]/g, '')
  return [stripped, kept]
}

/** Loại bỏ các ký tự đặc biệt/dấu câu để so khớp chữ thuần tuý */
export function stripPunctuation(s: string): string {
  return s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\[\]]/g, '')
}

/** Sinh ra danh sách các biến thể đáp án được chấp nhận */
export function getAcceptableVariants(expected: string, mode: FlashcardQuizMode): string[] {
  const variants = new Set<string>()

  if (mode === 'ja-vi') {
    // Tách theo dấu phẩy, dấu chấm phẩy, hoặc dấu gạch chéo
    const parts = expected.split(/[,;\/]/)
    for (const part of parts) {
      const normPart = normalizeTyping(part)
      if (!normPart) continue

      variants.add(normPart)

      const parenCleaned = cleanParentheses(normPart)
      for (const p of parenCleaned) {
        const cleaned = normalizeTyping(p)
        if (cleaned) {
          variants.add(cleaned)
          variants.add(normalizeTyping(stripPunctuation(cleaned)))
        }
      }
      variants.add(normalizeTyping(stripPunctuation(normPart)))
    }
  } else {
    const norm = normalizeTyping(expected)
    variants.add(norm)
    variants.add(normalizeTyping(stripPunctuation(norm)))
  }

  return Array.from(variants)
}

export type GradeResult = {
  isCorrect: boolean
  feedbackType: 'exact' | 'close' | 'accentless' | 'wrong' | 'override'
  matchedVariant?: string
  similarity?: number
}

/** Chấm đáp án gõ phím chi tiết (hỗ trợ viết tắt, thiếu dấu tiếng Việt, sai chính tả nhẹ). */
export function gradeKeyboardAnswerDetailed(
  input: string,
  card: FlashcardItem,
  mode: FlashcardQuizMode
): GradeResult {
  const n = normalizeTyping(input)
  if (!n) {
    return { isCorrect: false, feedbackType: 'wrong' }
  }

  // Lấy các đáp án được chấp nhận
  let expectedList: string[] = []
  if (mode === 'ja-vi') {
    expectedList = getAcceptableVariants(card.meaning, 'ja-vi')
  } else {
    expectedList = [
      card.kanji,
      card.reading || '',
      quizOptionLabel(card, 'vi-ja')
    ].filter(Boolean)
  }

  // 1. Khớp chính xác tuyệt đối (hoặc biến thể chính xác)
  for (const expected of expectedList) {
    const normExpected = normalizeTyping(expected)
    if (n === normExpected) {
      return { isCorrect: true, feedbackType: 'exact', matchedVariant: expected }
    }
  }

  // 2. Khớp không dấu tiếng Việt (chỉ dùng cho chế độ Nhật -> Việt)
  if (mode === 'ja-vi') {
    const inputNoTones = removeVietnameseTones(n)
    for (const expected of expectedList) {
      const expectedNoTones = removeVietnameseTones(normalizeTyping(expected))
      // Đảm bảo chuỗi đủ dài để tránh khớp nhầm ký tự ngắn
      if (inputNoTones === expectedNoTones && inputNoTones.length > 1) {
        return { isCorrect: true, feedbackType: 'accentless', matchedVariant: expected }
      }
    }
  }

  // 3. Khớp gần đúng (sai số nhỏ Levenshtein >= 80% tương đồng)
  for (const expected of expectedList) {
    const normExpected = normalizeTyping(expected)
    if (normExpected.length > 2) {
      const similarity = getSimilarityRatio(n, normExpected)
      if (similarity >= 0.8) {
        return {
          isCorrect: true,
          feedbackType: 'close',
          matchedVariant: expected,
          similarity
        }
      }
    }
  }

  return { isCorrect: false, feedbackType: 'wrong' }
}

/** Chấm đáp án gõ phím: khớp nghĩa (ja-vi) hoặc kanji / kanji·đọc / chỉ đọc (vi-ja). */
export function gradeKeyboardAnswer(input: string, card: FlashcardItem, mode: FlashcardQuizMode): boolean {
  return gradeKeyboardAnswerDetailed(input, card, mode).isCorrect
}

/** Câu trả lời mẫu hiển thị khi sai (gõ phím). */
export function expectedKeyboardHint(card: FlashcardItem, mode: FlashcardQuizMode): string {
  if (mode === 'ja-vi') return card.meaning.trim()
  return quizOptionLabel(card, 'vi-ja')
}
