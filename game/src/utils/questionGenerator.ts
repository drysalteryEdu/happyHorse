import type { CellType, CharData, Question } from '@/types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeOptions(correct: string, wrongPool: string[]): Pick<Question, 'options' | 'correctIndex'> {
  const wrongs = shuffle(wrongPool.filter(w => w !== correct)).slice(0, 3)
  // 补齐到3个干扰项
  const extras = ['甲', '乙', '丙', '丁', '戊', '己'].filter(c => c !== correct && !wrongs.includes(c))
  while (wrongs.length < 3) wrongs.push(extras[wrongs.length])
  const options = shuffle([correct, ...wrongs])
  return { options, correctIndex: options.indexOf(correct) }
}

const INITIALS = 'B P M F D T N L G K H J Q X Z C S R Y W'.split(' ')

function nasal(pinyin: string) {
  const p = pinyin.replace(/[1-4ü]/g, 'v')
  if (/[aeiov]ng/.test(p)) return '后鼻音'
  if (/[aeiov]n/.test(p)) return '前鼻音'
  return '不是鼻音'
}

export function generateQuestion(cellType: CellType, charData: CharData, allChars: CharData[]): Question {
  const { char, pinyin, strokes, radical, homophones } = charData

  switch (cellType) {
    case 'gray': {
      const wrongNums = [1,2,3,4,5,6,7,8,9,10,12,14,16,18,20]
        .filter(n => n !== strokes).map(String)
      const { options, correctIndex } = makeOptions(String(strokes), wrongNums)
      return { cellType, char, prompt: `"${char}" 共有几画？`, options, correctIndex }
    }

    case 'orange': {
      const allPinyins = [...new Set(allChars.map(c => c.pinyin).filter(p => p && p !== pinyin))]
      const { options, correctIndex } = makeOptions(pinyin, allPinyins)
      return { cellType, char, prompt: `"${char}" 的拼音是？`, options, correctIndex }
    }

    case 'purple': {
      const initial = (pinyin.match(/^[bpmfdtnlgkhjqxzcsr]h?|^[yw]/i)?.[0] ?? pinyin.charAt(0)).toUpperCase()
      const wrongs = INITIALS.filter(l => l !== initial)
      const { options, correctIndex } = makeOptions(initial, wrongs)
      return { cellType, char, prompt: `"${char}" 的音序（声母首字母）是？`, options, correctIndex }
    }

    case 'pink': {
      const correct = nasal(pinyin)
      const allChoices = ['前鼻音', '后鼻音', '不是鼻音', '翘舌音']
      const { options, correctIndex } = makeOptions(correct, allChoices.filter(c => c !== correct))
      return { cellType, char, prompt: `"${char}"（${pinyin}）属于？`, options, correctIndex }
    }

    case 'blue': {
      const validHomos = homophones.filter(h => h && h !== char)
      if (validHomos.length > 0) {
        const correct = validHomos[0]
        const wrongChars = allChars.map(c => c.char).filter(c => !homophones.includes(c) && c !== char)
        const { options, correctIndex } = makeOptions(correct, shuffle(wrongChars).slice(0, 6))
        return { cellType, char, prompt: `哪个字和"${char}"读音相同（同音字）？`, options, correctIndex }
      }
      // 无同音字数据 → 降级到笔画题
      return generateQuestion('gray', charData, allChars)
    }

    case 'khaki': {
      const wrongRadicals = [...new Set(allChars.map(c => c.radical).filter(r => r && r !== radical))]
      const { options, correctIndex } = makeOptions(radical, wrongRadicals)
      return { cellType, char, prompt: `"${char}" 的部首是？`, options, correctIndex }
    }

    case 'darkGreen': {
      // 找含相同部首的字
      const sameRadical = allChars.filter(c => c.radical === radical && c.char !== char).map(c => c.char)
      const diffChars = allChars.filter(c => c.radical !== radical).map(c => c.char)
      if (sameRadical.length > 0) {
        const correct = sameRadical[0]
        const { options, correctIndex } = makeOptions(correct, shuffle(diffChars).slice(0, 6))
        return { cellType, char, prompt: `哪个字和"${char}"含有相同的部首（${radical}）？`, options, correctIndex }
      }
      return generateQuestion('khaki', charData, allChars)
    }

    case 'yellow': {
      // 简化：问这个字的拼音（代替多音字题）
      return generateQuestion('orange', charData, allChars)
    }

    case 'lightGreen': {
      // 无字典页码数据 → 降级到部首题
      return generateQuestion('khaki', charData, allChars)
    }

    default:
      return generateQuestion('gray', charData, allChars)
  }
}
