import type { Book } from '@shared/api.interface';

export const levelNames = [
  'LAB',
  'L1',
  'L2',
  'L3',
  'L4',
  'L5',
  'L6',
];

export const levelSubtitles = [
  '启蒙级',
  '入门级',
  '基础级',
  '进阶级',
  '提高级',
  '挑战级',
  '精通级',
];

export const levelColors = [
  'bg-pink-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-slate-700',
];

const coverColorPalettes = [
  'from-pink-300 to-rose-400',
  'from-rose-300 to-red-400',
  'from-amber-300 to-orange-400',
  'from-emerald-300 to-teal-400',
  'from-sky-300 to-blue-400',
  'from-violet-300 to-purple-400',
  'from-cyan-300 to-sky-400',
  'from-lime-300 to-green-400',
  'from-fuchsia-300 to-pink-400',
  'from-yellow-300 to-amber-400',
  'from-indigo-300 to-violet-400',
  'from-orange-300 to-red-400',
];

const realBooks: Book[] = [
  {
    id: 'wojianjian',
    title: '我看见',
    pinyin: 'wǒ kàn jiàn',
    level: 0,
    levelName: 'LAB',
    description: '小女孩打开窗户，看见了红色的花、绿色的草、蓝色的天空……用眼睛去发现这个美丽的世界吧！',
    price: 16.9,
    coverColor: 'from-pink-200 to-rose-300',
    coverImage: 'books/pages/wojianjian/p01.jpg',
    pageImages: [
      'books/pages/wojianjian/p01.jpg',
      'books/pages/wojianjian/p02.jpg',
      'books/pages/wojianjian/p03.jpg',
      'books/pages/wojianjian/p04.jpg',
      'books/pages/wojianjian/p05.jpg',
      'books/pages/wojianjian/p06.jpg',
      'books/pages/wojianjian/p07.jpg',
      'books/pages/wojianjian/p08.jpg',
      'books/pages/wojianjian/p09.jpg',
      'books/pages/wojianjian/p10.jpg',
      'books/pages/wojianjian/p11.jpg',
      'books/pages/wojianjian/p12.jpg',
    ],
    totalPages: 12,
    previewPages: 4,
    author: 'Huali Xiong 熊华丽',
    illustrator: 'Wenpei Lin 林文佩',
    isNew: false,
    isFeatured: true,
    category: 'nature',
    publisher: 'Big Apple Chinese, Singapore',
  },
  {
    id: 'huaguoqi',
    title: '画国旗',
    pinyin: 'huà guó qí',
    level: 1,
    levelName: 'L1',
    description: '我们一起来画国旗吧！红色的旗面，五颗黄色的星星……我爱我的祖国。',
    price: 19.9,
    coverColor: 'from-orange-400 to-red-500',
    coverImage: 'books/pages/huaguoqi/p01.jpg',
    pageImages: [
      'books/pages/huaguoqi/p01.jpg',
      'books/pages/huaguoqi/p02.jpg',
      'books/pages/huaguoqi/p03.jpg',
      'books/pages/huaguoqi/p04.jpg',
      'books/pages/huaguoqi/p05.jpg',
      'books/pages/huaguoqi/p06.jpg',
      'books/pages/huaguoqi/p07.jpg',
      'books/pages/huaguoqi/p08.jpg',
      'books/pages/huaguoqi/p09.jpg',
      'books/pages/huaguoqi/p10.jpg',
      'books/pages/huaguoqi/p11.jpg',
      'books/pages/huaguoqi/p12.jpg',
    ],
    totalPages: 12,
    previewPages: 4,
    author: 'Huali Xiong 熊华丽',
    illustrator: 'Wenpei Lin 林文佩',
    isNew: true,
    isFeatured: true,
    category: 'culture',
    publisher: 'Big Apple Chinese, Singapore',
  },
  {
    id: 'chongwudian',
    title: '宠物店',
    pinyin: 'chǒng wù diàn',
    level: 1,
    levelName: 'L1',
    description: '小朋友们一起去宠物店，看到了可爱的小猫、小狗、小兔子……你最喜欢哪种小动物呢？',
    price: 19.9,
    coverColor: 'from-pink-300 to-orange-400',
    coverImage: 'books/pages/chongwudian/p01.jpg',
    pageImages: [
      'books/pages/chongwudian/p01.jpg',
      'books/pages/chongwudian/p02.jpg',
      'books/pages/chongwudian/p03.jpg',
      'books/pages/chongwudian/p04.jpg',
      'books/pages/chongwudian/p05.jpg',
      'books/pages/chongwudian/p06.jpg',
      'books/pages/chongwudian/p07.jpg',
      'books/pages/chongwudian/p08.jpg',
      'books/pages/chongwudian/p09.jpg',
      'books/pages/chongwudian/p10.jpg',
      'books/pages/chongwudian/p11.jpg',
      'books/pages/chongwudian/p12.jpg',
    ],
    totalPages: 12,
    previewPages: 4,
    author: 'Huali Xiong 熊华丽',
    illustrator: 'Wenpei Lin 林文佩',
    isNew: false,
    isFeatured: true,
    category: 'animals',
    publisher: 'Big Apple Chinese, Singapore',
  },
  {
    id: 'wenlu',
    title: '问路',
    pinyin: 'wèn lù',
    level: 3,
    levelName: 'L3',
    description: '小明想去公园，可是不认识路。他问了警察叔叔、老奶奶和小朋友，终于找到了公园！',
    price: 25.9,
    coverColor: 'from-orange-300 to-yellow-400',
    coverImage: 'books/pages/wenlu/p01.jpg',
    pageImages: [
      'books/pages/wenlu/p01.jpg',
      'books/pages/wenlu/p02.jpg',
      'books/pages/wenlu/p03.jpg',
      'books/pages/wenlu/p04.jpg',
      'books/pages/wenlu/p05.jpg',
      'books/pages/wenlu/p06.jpg',
      'books/pages/wenlu/p07.jpg',
      'books/pages/wenlu/p08.jpg',
      'books/pages/wenlu/p09.jpg',
      'books/pages/wenlu/p10.jpg',
      'books/pages/wenlu/p11.jpg',
      'books/pages/wenlu/p12.jpg',
    ],
    totalPages: 12,
    previewPages: 4,
    author: 'Huali Xiong 熊华丽',
    illustrator: 'Wenpei Lin 林文佩',
    isNew: false,
    isFeatured: true,
    category: 'daily',
    publisher: 'Big Apple Chinese, Singapore',
  },
  {
    id: 'xiaobaobaoxiaole',
    title: '小宝宝笑了',
    pinyin: 'xiǎo bǎo bao xiào le',
    level: 4,
    levelName: 'L4',
    description: '小宝宝为什么哭了？妈妈抱抱、给玩具、做鬼脸……最后小宝宝终于笑啦！',
    price: 28.9,
    coverColor: 'from-purple-300 to-violet-400',
    coverImage: 'books/pages/xiaobaobaoxiaole/p01.jpg',
    pageImages: [
      'books/pages/xiaobaobaoxiaole/p01.jpg',
      'books/pages/xiaobaobaoxiaole/p02.jpg',
      'books/pages/xiaobaobaoxiaole/p03.jpg',
      'books/pages/xiaobaobaoxiaole/p04.jpg',
      'books/pages/xiaobaobaoxiaole/p05.jpg',
      'books/pages/xiaobaobaoxiaole/p06.jpg',
      'books/pages/xiaobaobaoxiaole/p07.jpg',
      'books/pages/xiaobaobaoxiaole/p08.jpg',
      'books/pages/xiaobaobaoxiaole/p09.jpg',
      'books/pages/xiaobaobaoxiaole/p10.jpg',
      'books/pages/xiaobaobaoxiaole/p11.jpg',
      'books/pages/xiaobaobaoxiaole/p12.jpg',
    ],
    totalPages: 12,
    previewPages: 4,
    author: 'Huali Xiong 熊华丽',
    illustrator: 'Wenpei Lin 林文佩',
    isNew: true,
    isFeatured: true,
    category: 'family',
    publisher: 'Big Apple Chinese, Singapore',
  },
];

interface PlaceholderGroup {
  level: number;
  category: string;
  titles: string[];
}

const placeholderGroups: PlaceholderGroup[] = [
  {
    level: 0,
    category: 'first-words',
    titles: [
      '大苹果说汉语 第1册', '大苹果说汉语 第2册', '大苹果说汉语 第3册',
      '大苹果说汉语 第4册', '大苹果说汉语 第5册', '大苹果说汉语 第6册',
      '大苹果说汉语 第7册', '大苹果说汉语 第8册', '大苹果说汉语 第9册',
      '大苹果说汉语 第10册', '大苹果说汉语 第11册', '大苹果说汉语 第12册',
      '大苹果说汉语 第13册', '大苹果说汉语 第14册', '大苹果说汉语 第15册',
      '大苹果说汉语 第16册', '大苹果说汉语 第17册', '大苹果说汉语 第18册',
      '大苹果说汉语 第19册', '大苹果说汉语 第20册',
    ],
  },
  {
    level: 1,
    category: 'animals',
    titles: [
      '动物园', '小猫咪', '小狗汪汪', '小鸟飞呀飞', '小鱼游游',
      '大老虎', '小猴子', '大象伯伯', '熊猫宝宝', '小鸭子',
      '小青蛙', '小兔子乖乖', '小松鼠', '小蝴蝶', '小蜜蜂',
      '小蚂蚁', '小蜗牛', '小刺猬', '小企鹅', '小海豚',
      '大公鸡', '小绵羊', '小马驹', '小奶牛', '小老鼠',
      '小壁虎', '小金鱼', '热带鱼', '小螃蟹', '小海星',
    ],
  },
  {
    level: 1,
    category: 'colors',
    titles: [
      '红色的苹果', '黄色的香蕉', '蓝色的大海', '绿色的草地',
      '紫色的葡萄', '橙色的橘子', '粉色的桃花', '白色的云朵',
      '黑色的小猫', '棕色的小熊',
    ],
  },
  {
    level: 2,
    category: 'nature',
    titles: [
      '春天来了', '夏天的雨', '秋天的叶子', '冬天的雪',
      '太阳公公', '月亮姐姐', '小星星', '彩虹桥',
      '大山爷爷', '小河流水', '海边的风', '森林里',
      '花园里', '菜地里', '果园里', '草地上',
    ],
  },
  {
    level: 2,
    category: 'food',
    titles: [
      '我爱吃米饭', '包子真好吃', '饺子弯弯', '面条长长',
      '甜甜的蛋糕', '香香的饼干', '水果沙拉', '牛奶面包',
      '红豆粥', '冰糖葫芦', '冰淇淋', '巧克力',
    ],
  },
  {
    level: 3,
    category: 'daily',
    titles: [
      '早上好', '睡觉觉', '刷刷牙', '洗洗手',
      '穿衣服', '背上书包', '去幼儿园', '放学了',
      '过生日', '过新年', '中秋节', '端午节',
      '元宵节', '清明节', '劳动节', '儿童节',
    ],
  },
  {
    level: 3,
    category: 'family',
    titles: [
      '我的爸爸', '我的妈妈', '爷爷奶奶', '外公外婆',
      '我的哥哥', '我的姐姐', '小弟弟', '小妹妹',
      '全家福', '我爱我家',
    ],
  },
  {
    level: 4,
    category: 'adventure',
    titles: [
      '小探险家', '神秘的宝藏', '太空旅行', '海底世界',
      '恐龙乐园', '魔法森林', '会飞的鱼', '勇敢的小火车',
      '小兔子的旅行', '小熊过河', '小猫钓鱼', '小猴下山',
      '乌鸦喝水', '龟兔赛跑', '坐井观天', '守株待兔',
    ],
  },
  {
    level: 4,
    category: 'friends',
    titles: [
      '找朋友', '一起玩', '分享玩具', '对不起没关系',
      '谢谢你', '我的好朋友', '捉迷藏', '丢手绢',
      '跳皮筋', '踢毽子', '拍皮球', '放风筝',
    ],
  },
  {
    level: 5,
    category: 'culture',
    titles: [
      '孔子的故事', '司马光砸缸', '曹冲称象', '孔融让梨',
      '卧冰求鲤', '凿壁偷光', '囊萤映雪', '悬梁刺股',
      '嫦娥奔月', '后羿射日', '女娲补天', '精卫填海',
      '夸父追日', '盘古开天地', '哪吒闹海', '大闹天宫',
    ],
  },
  {
    level: 5,
    category: 'science',
    titles: [
      '水的故事', '风从哪里来', '雨是怎么形成的',
      '种子发芽', '小蝌蚪找妈妈', '蚕宝宝的一生',
      '白天和黑夜', '春夏秋冬', '认识方向',
      '磁铁的秘密', '声音的旅行', '光和影子',
    ],
  },
  {
    level: 6,
    category: 'history',
    titles: [
      '万里长城', '故宫博物院', '兵马俑', '敦煌莫高窟',
      '丝绸之路', '郑和下西洋', '造纸术', '印刷术',
      '火药的发明', '指南针', '唐诗的故事', '宋词之美',
      '三国演义', '西游记', '水浒传', '红楼梦',
    ],
  },
  {
    level: 6,
    category: 'values',
    titles: [
      '诚实的孩子', '勇敢的心', '善良的力量', '坚持就是胜利',
      '团结合作', '尊重他人', '保护环境', '节约用水',
      '爱护动物', '交通安全', '火灾逃生', '地震自救',
    ],
  },
];

const pinyinMap: Record<string, string> = {
  '动物园': 'dòng wù yuán',
  '小猫咪': 'xiǎo māo mī',
  '小狗汪汪': 'xiǎo gǒu wāng wāng',
  '小鸟飞呀飞': 'xiǎo niǎo fēi ya fēi',
  '小鱼游游': 'xiǎo yú yóu yóu',
  '大老虎': 'dà lǎo hǔ',
  '小猴子': 'xiǎo hóu zi',
  '大象伯伯': 'dà xiàng bó bo',
  '熊猫宝宝': 'xióng māo bǎo bao',
  '小鸭子': 'xiǎo yā zi',
  '小青蛙': 'xiǎo qīng wā',
  '小兔子乖乖': 'xiǎo tù zi guāi guāi',
  '小松鼠': 'xiǎo sōng shǔ',
  '小蝴蝶': 'xiǎo hú dié',
  '小蜜蜂': 'xiǎo mì fēng',
  '小蚂蚁': 'xiǎo mǎ yǐ',
  '小蜗牛': 'xiǎo wō niú',
  '小刺猬': 'xiǎo cì wei',
  '小企鹅': 'xiǎo qǐ é',
  '小海豚': 'xiǎo hǎi tún',
  '春天来了': 'chūn tiān lái le',
  '夏天的雨': 'xià tiān de yǔ',
  '秋天的叶子': 'qiū tiān de yè zi',
  '冬天的雪': 'dōng tiān de xuě',
  '太阳公公': 'tài yáng gōng gong',
  '月亮姐姐': 'yuè liang jiě jie',
  '小星星': 'xiǎo xīng xing',
  '彩虹桥': 'cǎi hóng qiáo',
  '早上好': 'zǎo shang hǎo',
  '过生日': 'guò shēng rì',
  '过新年': 'guò xīn nián',
  '我的爸爸': 'wǒ de bà ba',
  '我的妈妈': 'wǒ de mā ma',
  '我爱我家': 'wǒ ài wǒ jiā',
  '小探险家': 'xiǎo tàn xiǎn jiā',
  '找朋友': 'zhǎo péng you',
  '司马光砸缸': 'sī mǎ guāng zá gāng',
  '曹冲称象': 'cáo chōng chēng xiàng',
  '孔融让梨': 'kǒng róng ràng lí',
  '嫦娥奔月': 'cháng é bēn yuè',
  '精卫填海': 'jīng wèi tián hǎi',
  '夸父追日': 'kuā fù zhuī rì',
  '盘古开天地': 'pán gǔ kāi tiān dì',
  '哪吒闹海': 'né zhà nào hǎi',
  '大闹天宫': 'dà nào tiān gōng',
  '万里长城': 'wàn lǐ cháng chéng',
  '故宫博物院': 'gù gōng bó wù yuàn',
  '兵马俑': 'bīng mǎ yǒng',
  '丝绸之路': 'sī chóu zhī lù',
  '造纸术': 'zào zhǐ shù',
  '印刷术': 'yìn shuā shù',
  '指南针': 'zhǐ nán zhēn',
  '西游记': 'xī yóu jì',
  '水浒传': 'shuǐ hǔ zhuàn',
  '红楼梦': 'hóng lóu mèng',
  '三国演义': 'sān guó yǎn yì',
  '诚实的孩子': 'chéng shi de hái zi',
  '勇敢的心': 'yǒng gǎn de xīn',
};

function generatePinyin(title: string): string {
  if (pinyinMap[title]) return pinyinMap[title];
  const seriesMatch = title.match(/大苹果说汉语 第(\d+)册/);
  if (seriesMatch) {
    return `dà píngguǒ shuō hànyǔ dì ${seriesMatch[1]} cè`;
  }
  return title;
}

function generateDescription(title: string, level: number, category: string): string {
  const levelName = levelNames[level] || 'L1';
  const templates = [
    `《${title}》是大苹果说汉语系列 ${levelName} 级别的绘本，生动有趣，色彩鲜艳，让孩子在快乐中学习汉语。`,
    `一本关于${title}的有趣绘本，适合 ${levelName} 级别小朋友阅读，在故事中认识新汉字。`,
    `通过${title}的故事，帮助小朋友们认识世界，学习新的汉字和词语，开启汉语阅读之旅。`,
    `大苹果汉语系列之《${title}》，${levelName} 级别，陪孩子一起走进奇妙的汉语世界。`,
  ];
  const idx = (title.length + level + category.length) % templates.length;
  return templates[idx];
}

function generatePlaceholderBooks(): Book[] {
  const books: Book[] = [];
  let idCounter = 100;

  for (const group of placeholderGroups) {
    for (const title of group.titles) {
      const colorIdx = idCounter % coverColorPalettes.length;
      const isNew = idCounter % 11 === 0;
      const basePrice = 14.9 + group.level * 2.5;
      const priceVar = (idCounter % 5) * 0.5;

      books.push({
        id: `book-${idCounter}`,
        title,
        pinyin: generatePinyin(title),
        level: group.level,
        levelName: levelNames[group.level],
        description: generateDescription(title, group.level, group.category),
        price: Math.round((basePrice + priceVar) * 10) / 10,
        coverColor: coverColorPalettes[colorIdx],
        totalPages: 12,
        previewPages: 4,
        author: 'Huali Xiong 熊华丽',
        illustrator: 'Wenpei Lin 林文佩',
        publisher: 'Big Apple Chinese, Singapore',
        isNew,
        isFeatured: false,
        category: group.category,
      });
      idCounter++;
    }
  }

  return books;
}

export const allBooks: Book[] = [...realBooks, ...generatePlaceholderBooks()];

export const featuredBooks = allBooks.filter((b) => b.isFeatured);
export const newBooks = allBooks.filter((b) => b.isNew).slice(0, 12);

export function getBookById(id: string): Book | undefined {
  return allBooks.find((b) => b.id === id);
}

export function getBooksByLevel(level: number): Book[] {
  return allBooks.filter((b) => b.level === level);
}

export function searchBooks(query: string): Book[] {
  const q = query.toLowerCase();
  return allBooks.filter(
    (b) =>
      b.title.includes(query) ||
      b.pinyin.toLowerCase().includes(q) ||
      b.description.includes(query) ||
      b.levelName.toLowerCase().includes(q),
  );
}

export const levels = levelNames.map((name, idx) => ({
  level: idx,
  name,
  subtitle: levelSubtitles[idx],
  color: levelColors[idx],
  count: getBooksByLevel(idx).length,
}));
